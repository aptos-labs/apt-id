export interface Link {
  id: string;
  title: string;
  url: string;
}

export interface Profile {
  owner: string;
  ansName: string | null;
  name: string;
  profilePicture: string;
  description: string;
  title: string;
  links: Link[];
}
