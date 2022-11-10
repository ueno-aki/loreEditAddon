import { ItemStack, Player } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

const ShowMainMenu = async (item: ItemStack, target: Player) => {
    const { selection, canceled } = await new ActionFormData()
        .title("メインメニュー")
        .button("追加", "textures/blocks/furnace_front_on")
        .button("削除", "textures/blocks/furnace_front_off")
        .button("一括編集", "textures/blocks/cartography_table_top")
        .button("並び替え", "textures/ui/item_container_transfer_mode")
        .body("§l所持アイテム §r" + item.typeId)
        .show(target);
    if (canceled) return;
    switch (selection) {
        case MainSelect.add:
            await ShowAddMenu(item, target);
            break;
        case MainSelect.delete:
            await ShowDeleteMenu(item, target);
            break;
        case MainSelect.edit:
            await ShowEditMenu(item, target);
            break;
        case MainSelect.sort:
            await ShowSortMenu(item, target);
            break;
    }
};
const ShowAddMenu = async (item: ItemStack, target: Player) => {
    const { formValues, canceled } = await new ModalFormData()
        .title("追加")
        .textField("説明文", "入力してね", "")
        .show(target);
    if (!formValues || canceled) {
        await ShowMainMenu(item, target);
    } else {
        itemLorePush(item, formValues[0]);
        await ShowAddMenu(item, target);
    }
};
const ShowDeleteMenu = async (item: ItemStack, target: Player) => {
    const delMenu = new ActionFormData().title("削除").body("削除したいものを選択");
    const Lore = item.getLore();
    Lore.forEach((lore) => {
        delMenu.button(lore, "textures/ui/icon_sign");
    });
    const { selection, canceled } = await delMenu.button("メインメニューに戻る").show(target);
    if (canceled || selection === undefined || selection === Lore.length) {
        await ShowMainMenu(item, target);
    } else {
        Lore.splice(selection, 1);
        item.setLore(Lore);
        await ShowDeleteMenu(item, target);
    }
};
const ShowEditMenu = async (item: ItemStack, target: Player) => {
    const editMenu = new ModalFormData().title("一括編集");
    item.getLore().forEach((lore, index) => {
        editMenu.textField(`${index + 1}番目`, "入力してね", lore);
    });
    const { formValues, canceled } = await editMenu.show(target);
    if (!formValues || canceled) {
        await ShowMainMenu(item, target);
    } else {
        item.setLore(formValues);
        await ShowMainMenu(item, target);
    }
};
const ShowSortMenu = async (item: ItemStack, target: Player) => {
    const sortMenu = new ActionFormData();
    const Lore = item.getLore();
    Lore.forEach((lore) => {
        sortMenu.button(lore, "textures/ui/icon_sign");
    });
    const { selection, canceled } = await sortMenu.button("メインメニューに戻る").show(target);
    if (canceled || selection === undefined || selection === Lore.length) {
        await ShowMainMenu(item, target);
        return;
    }
    const option = await ShowSortOption(target);
    switch (option) {
        case SortSelect.Top:
            item.setLore([Lore[selection], ...Lore.filter((_, index) => index !== selection)]);
            break;
        case SortSelect.Up:
            if (selection == 0) break;
            const temp1 = Array.from(Lore);
            Lore[selection] = temp1[selection - 1];
            Lore[selection - 1] = temp1[selection];
            item.setLore(Lore);
            break;
        case SortSelect.Down:
            if (selection == Lore.length - 1) break;
            const temp2 = Array.from(Lore);
            Lore[selection] = temp2[selection + 1];
            Lore[selection + 1] = temp2[selection];
            item.setLore(Lore);
            break;
        case SortSelect.Bottom:
            item.setLore([...Lore.filter((_, index) => index !== selection), Lore[selection]]);
            break;
    }
    await ShowSortMenu(item, target);
};
const ShowSortOption = async (target: Player) => {
    const { selection } = await new ActionFormData()
        .title("移動")
        .button("一番上へ移動")
        .button("ひとつ上へ移動")
        .button("ひとつ下へ移動")
        .button("一番下へ移動")
        .button("キャンセル")
        .show(target);
    return selection !== 4 ? selection : undefined;
};
const itemLorePush = (item: ItemStack, extraLore: string | Array<string>) =>
    item.setLore(Array.isArray(extraLore) ? item.getLore().concat(extraLore) : [...item.getLore(), extraLore]);
enum MainSelect {
    add,
    delete,
    edit,
    sort,
}
enum SortSelect {
    Top,
    Up,
    Down,
    Bottom,
}
export { ShowMainMenu };
