import { Player } from "@minecraft/server";
import { ActionFormData, FormCancelationReason } from "@minecraft/server-ui";
import { itemIdAuxs } from "./itemIDAux";

export class ContainerMenu {
    readonly menuName: string;
    readonly size: number;
    #ItemMap: Map<number, ItemInfo>;
    constructor(menuName: string, size: number) {
        this.menuName = menuName;
        this.size = ContainerMenu.#returnNineSlice(size);
        this.#ItemMap = new Map();
    }
    setItem(slot: number | Array<number>, item: ItemInfo) {
        if (typeof slot === "number") {
            this.#ItemMap.set(slot >= 0 ? slot : this.size + slot, item);
        } else {
            slot.forEach((value) => {
                this.#ItemMap.set(value >= 0 ? value : this.size + value, item);
            });
        }
        return this;
    }
    setContents(itemElements: { [key: number]: ItemInfo }) {
        Object.entries(itemElements).forEach(([key, itemInfo]) => {
            this.setItem(+key, itemInfo);
        });
        return this;
    }
    setContentAll(item: ItemInfo) {
        for (let i = 0; i < this.size; i++) {
            this.#ItemMap.set(i, item);
        }
        return this;
    }
    clear(slot: number) {
        this.#ItemMap.delete(slot >= 0 ? slot : this.size + slot);
        return this;
    }
    clearContentAll() {
        this.#ItemMap.clear();
    }
    async show(player: Player): Promise<ContainerFormResponce> {
        const form = new ActionFormData().title("container").body("§0" + this.menuName);
        //formを横真ん中で区切って,上がlore,下がAux.それをズラして重ねている
        //(上半分)loreを書く処理
        for (let i = 0; i < this.size; i++) {
            const item = this.#ItemMap.get(i);
            form.button(`${item && item.lore ? item.lore.join("\n§r") : ""}`);
        }
        //(下半分)Auxを書く処理
        for (let j = this.size; j < this.size * 2; j++) {
            const item = this.#ItemMap.get(j - this.size);
            form.button(`${item ? ContainerMenu.#getItemIDAux(item) ?? 0 : 0}`);
        }
        const { selection, canceled, cancelationReason } = await form.show(player);
        return {
            selectedSlot: selection,
            selectedItem: selection !== undefined ? this.#ItemMap.get(selection) : void 0,
            canceled: canceled,
            cancelReason: cancelationReason,
        };
    }
    //9個ずつじゃないと半分にするとき支障が出るため強制的に一番近い9の倍数に繰り*上げ*
    static #returnNineSlice(size: number): number {
        if (size <= 0) {
            return 9;
        } else {
            return size + 8 - ((size - 1) % 9);
        }
    }
    //itemIdAuxオブジェクトから取ってくる,interFaceとかより素直にオブジェクトにした
    static #getItemIDAux = (item: ItemInfo) => {
        const { itemKey } = item;
        const enchantIfNeed = item.foil ? 32768 : 0;
        const dataIfNeed = item.data ?? 0;
        return this.#isIdAuxKey(itemKey) ? itemIdAuxs[itemKey] * 65536 + enchantIfNeed + dataIfNeed : void 0;
    };
    //itemIdAux[itemKey]で取り出したいから,itemKeyをUnion型("barrier"|"clock"|"diamond")に型推論させるやつ.そのままだとanyになってまう
    static #isIdAuxKey(value: string): value is keyof typeof itemIdAuxs {
        return Object.getOwnPropertyNames(itemIdAuxs).some((key) => key === value);
    }
}

interface ItemInfo {
    itemKey: keyof typeof itemIdAuxs;
    lore?: Array<string>;
    data?: number;
    foil?: boolean;
}
interface ContainerFormResponce {
    selectedSlot?: number;
    canceled: boolean;
    cancelReason?: FormCancelationReason;
    selectedItem?: ItemInfo;
}
