import { Injectable, Logger } from '@nestjs/common';
import * as yaml from 'js-yaml';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export interface PromptTemplate {
  name: string;
  description: string;
  system_prompt: string;
  variables: string[];
  example?: {
    user_message: string;
    variables_injected: Record<string, any>;
  };
}

export interface PromptConfig {
  [key: string]: PromptTemplate;
}

@Injectable()
export class PromptService {
  private readonly logger = new Logger(PromptService.name);
  private prompts: PromptConfig = {};
  private readonly promptsPath = path.join(__dirname, '..', 'prompts', 'chat-prompts.yaml');

  constructor() {
    this.loadPrompts();
    // Handlebars 헬퍼 등록
    this.registerHandlebarsHelpers();
  }

  /**
   * YAML 파일에서 프롬프트 템플릿들을 로드
   */
  private loadPrompts(): void {
    try {
      if (!fs.existsSync(this.promptsPath)) {
        this.logger.error(`프롬프트 파일을 찾을 수 없습니다: ${this.promptsPath}`);
        return;
      }

      const yamlContent = fs.readFileSync(this.promptsPath, 'utf8');
      const loadedPrompts = yaml.load(yamlContent) as PromptConfig;

      if (!loadedPrompts || typeof loadedPrompts !== 'object') {
        this.logger.error('유효하지 않은 프롬프트 YAML 형식입니다.');
        return;
      }

      this.prompts = loadedPrompts;
      this.logger.log(`${Object.keys(this.prompts).length}개의 프롬프트 템플릿을 로드했습니다.`);
    } catch (error) {
      this.logger.error('프롬프트 로드 중 오류 발생:', error);
    }
  }

  /**
   * Handlebars 커스텀 헬퍼 등록
   */
  private registerHandlebarsHelpers(): void {
    // 날짜 포맷팅 헬퍼
    Handlebars.registerHelper('formatDate', (date: string, format: string) => {
      // 간단한 날짜 포맷팅 (실제로는 date-fns 같은 라이브러리 사용 권장)
      const dateObj = new Date(date);
      switch (format) {
        case 'YYYY-MM-DD':
          return dateObj.toISOString().split('T')[0];
        case 'YYYY년 MM월 DD일':
          return `${dateObj.getFullYear()}년 ${String(dateObj.getMonth() + 1).padStart(2, '0')}월 ${String(dateObj.getDate()).padStart(2, '0')}일`;
        default:
          return date;
      }
    });

    // 조건부 헬퍼
    Handlebars.registerHelper('if_equals', function (a: any, b: any, opts: any) {
      if (a === b) {
        return opts.fn(this);
      } else {
        return opts.inverse(this);
      }
    });

    // 기본값 헬퍼
    Handlebars.registerHelper('default', (value: any, defaultValue: any) => {
      return value || defaultValue;
    });
  }

  /**
   * 모든 사용 가능한 프롬프트 템플릿 목록 반환
   */
  getAvailablePrompts(): { key: string; name: string; description: string; variables: string[] }[] {
    return Object.entries(this.prompts).map(([key, template]) => ({
      key,
      name: template.name,
      description: template.description,
      variables: template.variables || [],
    }));
  }

  /**
   * 특정 프롬프트 템플릿 정보 조회
   */
  getPromptTemplate(key: string): PromptTemplate | null {
    return this.prompts[key] || null;
  }

  /**
   * 프롬프트 템플릿에 변수를 주입하여 최종 프롬프트 생성
   */
  generatePrompt(
    templateKey: string,
    variables: Record<string, any> = {},
  ): { systemPrompt: string; template: PromptTemplate } | null {
    const template = this.getPromptTemplate(templateKey);
    if (!template) {
      this.logger.warn(`존재하지 않는 프롬프트 템플릿: ${templateKey}`);
      return null;
    }

    try {
      // 기본 변수들 설정
      const defaultVariables = {
        currentDate: new Date().toISOString().split('T')[0],
        currentYear: new Date().getFullYear(),
        currentMonth: new Date().getMonth() + 1,
        currentDay: new Date().getDate(),
      };

      const mergedVariables = { ...defaultVariables, ...variables };

      // Handlebars 컴파일 및 변수 주입
      const compiledTemplate = Handlebars.compile(template.system_prompt);
      const systemPrompt = compiledTemplate(mergedVariables);

      this.logger.debug(`프롬프트 생성 완료: ${templateKey}`);
      return { systemPrompt, template };
    } catch (error) {
      this.logger.error(`프롬프트 생성 중 오류 발생: ${templateKey}`, error);
      return null;
    }
  }

  /**
   * 템플릿의 필수 변수 검증
   */
  validateRequiredVariables(templateKey: string, variables: Record<string, any>): {
    isValid: boolean;
    missingVariables: string[];
  } {
    const template = this.getPromptTemplate(templateKey);
    if (!template) {
      return { isValid: false, missingVariables: [] };
    }

    const requiredVariables = template.variables || [];
    const missingVariables = requiredVariables.filter(
      (variable) => variables[variable] === undefined || variables[variable] === null || variables[variable] === '',
    );

    return {
      isValid: missingVariables.length === 0,
      missingVariables,
    };
  }

  /**
   * 프롬프트 파일 다시 로드 (개발 시 유용)
   */
  reloadPrompts(): void {
    this.logger.log('프롬프트 파일을 다시 로드합니다...');
    this.loadPrompts();
  }

  /**
   * 특정 템플릿의 예시 확인
   */
  getPromptExample(templateKey: string): any {
    const template = this.getPromptTemplate(templateKey);
    if (!template || !template.example) {
      return null;
    }

    // 예시 변수를 사용하여 실제 프롬프트 생성
    const generated = this.generatePrompt(templateKey, template.example.variables_injected);
    return {
      userMessage: template.example.user_message,
      variablesUsed: template.example.variables_injected,
      generatedSystemPrompt: generated?.systemPrompt,
    };
  }
}
