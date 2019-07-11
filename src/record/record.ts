export class Record {
  content: string;
  lastEditor: string | null;

  constructor(
    readonly name: string,
    content: string,
    readonly isPublic: boolean,
    readonly usersWithReadAccess: ReadonlyArray<string>,
    readonly usersWithEditAccess: ReadonlyArray<string>,
  ) {
    this.content = content;
    this.lastEditor = null;
  }
}
