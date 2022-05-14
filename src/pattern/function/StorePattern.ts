import { Store } from "pullstate";

interface StatePattern {
  selectedPattern: string;
  selectedInstance: string;
}

export const StorePattern = new Store<StatePattern>({
  selectedInstance: "",
  selectedPattern: "",
});
