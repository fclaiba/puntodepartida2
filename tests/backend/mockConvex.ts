type TableRecord = Record<string, any> & { _id?: string };

type Predicate = (doc: TableRecord) => boolean;

class MockIndexBuilder {
  private predicates: Predicate[] = [];

  eq(field: string, value: any) {
    this.predicates.push((doc) => doc[field] === value);
    return this;
  }

  gte(field: string, value: any) {
    this.predicates.push((doc) => doc[field] >= value);
    return this;
  }

  apply(data: TableRecord[]) {
    if (this.predicates.length === 0) {
      return data;
    }
    return data.filter((doc) => this.predicates.every((predicate) => predicate(doc)));
  }
}

class MockQuery {
  constructor(private readonly data: TableRecord[]) { }

  withIndex(_: string, predicate: (builder: MockIndexBuilder) => void) {
    const builder = new MockIndexBuilder();
    predicate(builder);
    return new MockQuery(builder.apply(this.data));
  }

  order(direction: "asc" | "desc") {
    const multiplier = direction === "asc" ? 1 : -1;
    const sorted = [...this.data].sort((a, b) => {
      const aTime = typeof a._creationTime === "number" ? a._creationTime : 0;
      const bTime = typeof b._creationTime === "number" ? b._creationTime : 0;
      return (aTime - bTime) * multiplier;
    });
    return new MockQuery(sorted);
  }

  async collect() {
    return [...this.data];
  }

  async first() {
    return this.data[0] ?? null;
  }
}

export class MockDb {
  private tables: Record<string, TableRecord[]> = {};
  private counters: Record<string, number> = {};
  private idLookup: Map<string, { table: string; doc: TableRecord }> = new Map();

  private nextId(table: string) {
    const next = (this.counters[table] ?? 0) + 1;
    this.counters[table] = next;
    return `${table}_${next}`;
  }

  private resolveTable(table: string) {
    if (!this.tables[table]) {
      this.tables[table] = [];
    }
    return this.tables[table];
  }

  seed(table: string, doc: TableRecord) {
    if (!doc._id) {
      throw new Error("Seeded documents must include an _id");
    }
    const tableData = this.resolveTable(table);
    const entry = { ...doc };
    tableData.push(entry);
    this.idLookup.set(entry._id!, { table, doc: entry });
    return entry;
  }

  table(table: string) {
    return this.tables[table] ?? [];
  }

  async insert(table: string, doc: TableRecord) {
    const tableData = this.resolveTable(table);
    const _id = this.nextId(table);
    const entry = { ...doc, _id };
    tableData.push(entry);
    this.idLookup.set(_id, { table, doc: entry });
    if (!(entry as any)._creationTime) {
      (entry as any)._creationTime = Date.now();
    }
    return _id;
  }

  async patch(id: string, updates: Record<string, any>) {
    const target = this.idLookup.get(id);
    if (!target) {
      throw new Error(`Cannot patch unknown id ${id}`);
    }
    Object.assign(target.doc, updates);
  }

  async get(id: string) {
    const target = this.idLookup.get(id);
    return target ? target.doc : null;
  }

  query(table: string) {
    const tableData = this.resolveTable(table);
    return new MockQuery(tableData);
  }
}

export const createMutationCtx = () => {
  const db = new MockDb();
  const ctx = {
    db,
    storage: {
      getUrl: async () => "",
      delete: async () => { },
    },
  };
  return { ctx: ctx as any, db };
};



