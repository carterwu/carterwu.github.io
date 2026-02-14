export interface BlogPost {
  slug: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

export const post: BlogPost = {
  slug: 'hello-github',
  title: 'Hello Github',
  content: 'Hello Github',
  date: '2026-02-14',
  author: 'Carter Wu'
};
