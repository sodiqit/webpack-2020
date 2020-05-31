export class Post {
  title: string;

  date: Date;

  constructor(title: string) {
    this.title = title;
    this.date = new Date();
  }
}
