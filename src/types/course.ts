export interface CourseDocument {
  Id?: string;
  CreatedById?: string;
  CreatedDate?: string;
  UpdatedDate?: string;
  UpdatedById?: string;
  CustomerId?: string;
  IsDeleted?: boolean;
  UserName?: string;
  FileName: string;
  ACCACourseId?: string;
  isNew?: boolean;
}

export interface LevelPreference {
  Id?: string;
  PreferenceId?: string;
  Level?: string;
  SingleQuestionCount?: number;
  MultipleQuestionCount?: number;
  TrueFalseCount?: number;
  FIBCount?: number;
  ImageRequired?: boolean;
  QuestionsRequired?: boolean;
  ScromRequired?: boolean;
}

export interface CoursePreference {
  Id?: string;
  CreatedById?: string;
  CreatedDate?: string;
  UpdatedDate?: string;
  UpdatedById?: string;
  CustomerId?: string;
  IsDeleted?: boolean;
  UserName?: string;
  DurationScope?: number;
  ModuleCount?: number;
  ModuleSpanTime?: number;
  QuestionGenAt?: number;
  SingleQuestionCount?: number;
  MultipleQuestionCount?: number;
  TrueFalseCount?: number;
  FIBCount?: number;
  SCROMQuestionCount?: number;
  ScromSingleQuestionCount?: number;
  ScromMultipleQuestionCount?: number;
  ScromTrueFalseCount?: number;
  ScromFIBCount?: number;
  Style?: string;
  DescriptionFormat?: string;
  Remember?: boolean;
  Analyze?: boolean;
  Understand?: boolean;
  Evalution?: boolean;
  Create?: boolean;
  Knowledge?: boolean;
  Analysis?: boolean;
  Comprehension?: boolean;
  Evaluation?: boolean;
  Application?: boolean;
  Synthesis?: boolean;
  Children?: boolean;
  MiddleAge?: boolean;
  Teenager?: boolean;
  Older?: boolean;
  Young?: boolean;
  Senior?: boolean;
  Kindergarden?: boolean;
  PrePrimary?: boolean;
  Primary?: boolean;
  Secondary?: boolean;
  SeniorSecondary?: boolean;
  Graduation?: boolean;
  PostGraduation?: boolean;
  Educational?: boolean;
  Banking?: boolean;
  Retail?: boolean;
  Manufacturing?: boolean;
  Region?: string;
  LearningObjective?: string;
  Guidelines?: string;
  Exclusions?: string;
  IncludesExamples?: boolean;
  GenerateCourse?: number;
  PromptText?: string;
  Temparature?: number;
  LevelPreferences?: LevelPreference[];
  ImageGenAt?: number;
  ScromGenAt?: number;
  IsApplyTaxonmy?: boolean;
  Level1Label?: string;
  Level2Label?: string;
  Level3Label?: string;
  Level4Label?: string;
  Level5Label?: string;
}

export interface CourseAnswer {
  Id?: string;
  CreatedById?: string;
  CreatedDate?: string;
  UpdatedDate?: string;
  UpdatedById?: string;
  CustomerId?: string;
  IsDeleted?: boolean;
  UserName?: string;
  Sno?: number;
  QuestionId?: string;
  Text?: string;
  IsCorrect?: boolean;
  Explanation?: string;
}

export interface CourseQuestion {
  Id?: string;
  CreatedById?: string;
  CreatedDate?: string;
  UpdatedDate?: string;
  UpdatedById?: string;
  CustomerId?: string;
  IsDeleted?: boolean;
  UserName?: string;
  Text?: string;
  Type?: string;
  ChapterId?: string;
  Answers?: CourseAnswer[];
}

export interface CourseChapter {
  Id?: string;
  CreatedById?: string;
  CreatedDate?: string;
  UpdatedDate?: string;
  UpdatedById?: string;
  CustomerId?: string;
  IsDeleted?: boolean;
  UserName?: string;
  Title?: string;
  CourseId?: string;
  Description?: string;
  Questions?: CourseQuestion[];
  ParentId?: string;
  BluprintCId?: string;
  IntellectualLevel?: string;
  CourseChapters?: CourseChapter[] | string[];
  RowState?: string;
  TimeSpan?: number;
  InputTokens?: number;
  OutputTokens?: number;
  SingleQuestionCount?: number;
  MultipleQuestionCount?: number;
  TrueFalseCount?: number;
  FIBCount?: number;
  IsGenerated?: boolean;
  Level?: number;
  IsCompleteChapterGenerated?: boolean;
  ChapterStatus?: number;
  ChapterStartTime?: string;
  ImagePath?: string;
  ChapterImage?: string;
  ThumbImage?: string;
  BinaryData?: Record<string, any>;
  ImageGenerated?: boolean;
  Inclusions?: string;
  Exclusions?: string;
  QuestionInclusions?: string;
  QuesionExclusions?: string;
}

export interface CourseToken {
  Id?: string;
  CreatedById?: string;
  CreatedDate?: string;
  UpdatedDate?: string;
  UpdatedById?: string;
  CustomerId?: string;
  IsDeleted?: boolean;
  UserName?: string;
  CourseId?: string;
  Operation?: number;
  InputTokens?: number;
  OutputTokens?: number;
  UserId?: string;
  WordCount?: number;
  SpanTime?: number;
  Title?: string;
  ChapterId?: string;
}

export interface CourseEmbedding {
  Id?: string;
  Text?: string;
  Vector?: number[];
}

export interface CourseCreateRequest {
  Id?: string;
  CreatedById?: string;
  CreatedDate?: string;
  UpdatedDate?: string;
  UpdatedById?: string;
  CustomerId?: string;
  IsDeleted?: boolean;
  UserName?: string;
  Title: string;
  ChapterCount?: number;
  Description?: string;
  CourseImage?: string;
  ThumbImage?: string;
  CourseStatus?: number;
  CompletePercent?: number;
  CourseDocuments?: CourseDocument[];
  Preference?: CoursePreference;
  ImagePath?: string;
  IsGeneratedFromFile?: boolean;
  GeneratedFileName?: string;
  Intruduction?: string;
  SyllabusIntruduction?: string;
  Capabilities?: string;
  Operation?: number;
  BinaryData?: Record<string, any>;
  Data?: string;
  InputTokens?: number;
  OutputTokens?: number;
  IsEmbadingsCreated?: boolean;
  CollectionName?: string;
  ChapterId?: string;
  QuestionId?: string;
  AnswerId?: string;
  TimeSpan?: number;
  Tokens?: CourseToken[];
  ModalName?: string;
  StartTime?: string;
  EndTime?: string;
  AvailableTokens?: number;
  CourseChapters?: CourseChapter[];
  BlueprintId?: string;
  BlueprintName?: string;
  LayoutType?: number;
  IsFromBackground?: boolean;
  CustId?: string;
  UserId?: string;
  Inputs?: string[];
  Embadings?: CourseEmbedding[];
}

export interface CourseCreateResponse extends CourseCreateRequest {
  Id: string;
  CreatedDate: string;
}
