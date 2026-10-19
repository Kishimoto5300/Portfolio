export const TASTE_OPTIONS = [
  'さっぱり',
  'こってり',
  '辛い',
  '酸っぱい',
  '和風',
  '洋風',
  '中華風',
] as const;

export type TasteOption = (typeof TASTE_OPTIONS)[number];
export type Category = '主食' | '主菜' | '副菜';

export type Dish = {
  name: string;
  category: Category;
  price: number;
  calorie: number;
  cookTime: number;
  taste: TasteOption[];
};
