export type UserIdHeader = {
  "X-User-ID": string;
};

export type GetSchoolClassesRequest = {
  name: string;
};

export type SchoolClassSummary = {
  className: string;
  points: number;
};

export type PagedSchoolClassesResponse = {
  content: SchoolClassSummary[];
  pageable?: unknown;
  last?: boolean;
  totalPages?: number;
  totalElements?: number;
  size?: number;
  number?: number;
  sort?: unknown;
  first?: boolean;
  numberOfElements?: number;
  empty?: boolean;
};

export type GetSchoolClassesResponse =
  | SchoolClassSummary[]
  | PagedSchoolClassesResponse;

export const GET_SCHOOL_CLASSES_PATH = "/class/school";
