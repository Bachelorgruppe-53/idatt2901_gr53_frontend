export interface CareerDto {
  id?: number;
  career_id?: number;
  title?: string;
  name?: string;
  iconName?: string;
  color?: number;
  colorCode?: number;
}

export interface UnlockedCareer {
  career_id: number;
  name: string;
  iconName: string | null;
  colorCode: number | null;
}
