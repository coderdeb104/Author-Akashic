export type Character = {
  id: string;
  user_id: string;
  created_at: string;
  name: string;
  age: number | null;
  sex: string | null;
  race: string | null;
  spouse: string | null;
  vital_status: string | null;
  role: string | null;
  intro: string;
  appearance: {
    height: string;
    hair: string;
    eyes: string;
    distinguishing_features: string;
  };
  description: string | null;
  trivia: string | null;
  image_url: string | null;
};
