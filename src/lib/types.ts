
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

export type Place = {
    id: string;
    user_id: string;
    created_at: string;
    name: string;
    description: string | null;
};

export type FamilyName = {
    id: string;
    user_id: string;
    created_at: string;
    name: string;
    description: string | null;
    family_head: string | null;
    members: string | null;
};

export type Event = {
    id: string;
    user_id: string;
    created_at: string;
    title: string;
    description: string | null;
    event_date: string | null;
};

export type Quote = {
    id: string;
    user_id: string;
    created_at: string;
    text: string;
    author: string | null;
};

export type Worldbuild = {
    id: string;
    user_id: string;
    created_at: string;
    topic: string;
    fact: string | null;
};

export type WorldTopic = {
    id: string;
    user_id: string;
    created_at: string;
    name: string;
    description: string | null;
};

export type WorldFact = {
    id: string;
    user_id: string;
    created_at: string;
    topic_id: string;
    summary: string;
    details: string | null;
};
