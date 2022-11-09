import { Player } from "@minecraft/server";
import { ContainerMenu } from "./ContainerMenu";
const showMainMenu = async (player: Player) => {
    const mainMenu = new ContainerMenu("main", 45)
        .setContentAll({ itemKey: "invisible_bedrock", lore: ["不可視の岩盤"] })
        .setItem(-1, { itemKey: "chest_minecart", lore: ["ATM", "yeah"] });
    const { selectedItem, selectedSlot, canceled, cancelReason } = await mainMenu.show(player);
    if (selectedItem) {
        showMainMenu(player);
        console.warn(selectedItem.itemKey, selectedItem.lore, selectedItem.data, selectedSlot);
    }
};
export { showMainMenu };
