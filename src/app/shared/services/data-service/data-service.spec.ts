import { TestBed } from '@angular/core/testing';

import { DataService } from './data-service';

interface TestStoreState {
  title: string;
  list: string[];
}

class TestStore extends DataService<TestStoreState> {
  constructor(state: TestStoreState) {
    super(state);
  }
}

describe('Abstract Class Inheritance', () => {
  let service: DataService<{ name: string }>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = new (class extends DataService<{ name: string }> {
      constructor() {
        super({ name: 'initial' });
      }
    })();
  });

  it('Inherits the Store constructor', () => {
    // instance creation and inherited methods/properties
    expect(service).toBeTruthy();
    expect(service instanceof DataService).toBeTrue();
    expect(service.select).toBeDefined();
    expect(service.setState).toBeDefined();
    expect(service.state).toBeDefined();
    expect(service.state$).toBeDefined();
  });

  it('should get the initial state', () => {
    expect(service.state).toEqual({ name: 'initial' });
  });

  it('should select a property from the state', (done) => {
    service
      .select((state) => state.name)
      .subscribe((name) => {
        expect(name).toEqual('initial');
        done();
      });
  });

  it('should clear the state', () => {
    service.clearState();
    expect(service.state).toBeNull();
  });
});

describe('State', () => {
  let store: TestStore;

  describe('Static and Observable State Accessors', () => {
    beforeEach(() => (store = new TestStore({ list: [], title: 'Test Store' })));

    it('Exposes a current static `state` snapshot', () => {
      // static property exposes the full store and all properties
      expect(store.state).toEqual({ list: [], title: 'Test Store' });
      expect(store.state.list).toEqual([]);
      expect(store.state.title).toEqual('Test Store');
    });

    it('Exposes a current `state$` Observable', (done: DoneFn) => {
      // Observable exposes the same state as static
      store.state$.subscribe((state) => expect(state).toEqual({ list: [], title: 'Test Store' }));
      done();
    });
  });

  describe('Set State Method', () => {
    beforeEach(() => (store = new TestStore({ list: [], title: 'Test Store' })));

    it('Sets new state as a full or partial update', () => {
      // partial state update
      store.setState(({ list }) => ({
        // spread existing `list`, not needed here as empty but good practice anyway...
        list: [...list, 'P1', 'P2', 'P3', 'P4'],
      }));

      // maintains `title`
      expect(store.state).toEqual({
        title: 'Test Store',
        list: ['P1', 'P2', 'P3', 'P4'],
      });

      // partial state update
      store.setState(() => ({
        title: 'New Title',
      }));

      // maintains `list`
      expect(store.state).toEqual({
        title: 'New Title',
        list: ['P1', 'P2', 'P3', 'P4'],
      });

      // full state update
      store.setState(({ list }) => ({
        title: 'Another Title',
        list: [...list, 'P5', 'P6', 'P7'],
      }));

      // updates everything nicely...
      expect(store.state).toEqual({
        title: 'Another Title',
        list: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'],
      });
    });
  });
});
