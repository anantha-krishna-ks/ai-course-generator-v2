export interface BlueprintChapter {
  Id?: string;
  CreatedById?: string;
  CreatedDate?: string;
  UpdatedDate?: string;
  UpdatedById?: string;
  CustomerId?: string;
  IsDeleted?: boolean;
  UserName?: string;
  Title: string;
  BlueprintId?: string;
  ParentId?: string;
  BlueprintChapters?: string[];
}

export interface BlueprintDocument {
  Id?: string;
  CreatedById?: string;
  CreatedDate?: string;
  UpdatedDate?: string;
  UpdatedById?: string;
  CustomerId?: string;
  IsDeleted?: boolean;
  UserName?: string;
  FileName: string;
  BlueprintId?: string;
  isNew?: boolean;
  DocumentPath?: string;
}

export interface AIConfig {
  Id?: string;
  CreatedById?: string;
  CreatedDate?: string;
  UpdatedDate?: string;
  UpdatedById?: string;
  CustomerId?: string;
  IsDeleted?: boolean;
  UserName?: string;
  CourseUnitCount?: number;
  BlueprintId?: string;
  Level?: number;
}

export interface BlueprintCreateRequest {
  Id?: string;
  CreatedById?: string;
  CreatedDate?: string;
  UpdatedDate?: string;
  UpdatedById?: string;
  CustomerId?: string;
  IsDeleted?: boolean;
  UserName?: string;
  Title: string;
  BlueprintStatus?: number;
  BlueprintType?: number;
  BlueprintChapters?: BlueprintChapter[];
  BlueprintDocuments?: BlueprintDocument[];
  Intruduction?: string;
  Capabilities?: string;
  BlueprintId?: string;
  Operation?: number;
  Data?: string;
  ContentTemperature?: number;
  InputTokens?: number;
  OutputTokens?: number;
  Levels?: Record<string, number>;
  NoOfLevels?: number;
  LayoutType?: number;
  BinaryData?: Record<string, any>;
  AIConfigs?: AIConfig[];
  BlueprintSupportDocuments?: BlueprintDocument[];
  IsEmbadingsCreated?: boolean;
  Files?: Array<[Record<string, any>, string]>;
  UserId?: string;
}

export interface BlueprintCreateResponse extends BlueprintCreateRequest {
  Id: string;
  CreatedDate: string;
}

export interface BlueprintListItem {
  Id: string;
  Title: string;
  BlueprintStatus: number;
  BlueprintType: number;
  CreatedDate: string;
  UpdatedDate: string;
  NoOfLevels?: number;
  CreatedById?: string;
  UpdatedById?: string;
}

export interface BlueprintListResponse {
  Status: number;
  Message?: string;
  Entity?: BlueprintListItem[];
  TotalRecords: number;
}
