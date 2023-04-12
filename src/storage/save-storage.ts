import { SaveData } from '@/super-patience'
import { JSONStorage } from '@/void'

const saveKey = 'save'

export class SaveStorage {
  static load(storage: Storage): SaveStorage {
    const jsonStorage = new JSONStorage(storage)
    const save = jsonStorage.get<SaveData>(saveKey) ?? SaveData(0)
    return new SaveStorage(save, jsonStorage)
  }

  readonly #data: SaveData
  readonly #storage: JSONStorage

  constructor(data: SaveData, storage: JSONStorage) {
    this.#data = data
    this.#storage = storage
  }

  get data(): SaveData {
    return this.#data
  }

  save(): void {
    this.#storage.put(saveKey, this.#data)
  }
}
