import { Entity, EntityInventoryComponent, IEntityComponent, Player, world } from "@minecraft/server";
import { ShowMainMenu } from "./Form/EditForm";
const EditorTag = "LoreEditor";
const cmdPrefix = "!";
world.events.beforeItemUse.subscribe(async (ev) => {
    const { item, source } = ev;
    if (isPlayer(source) && source.isSneaking && source.hasTag(EditorTag)) {
        ev.cancel = true;
        await ShowMainMenu(item, source);
        const inventory = source.getComponent("inventory");
        if (!(inventory && isInventory(inventory))) return;
        inventory.container.setItem(source.selectedSlot, item);
    }
});
world.events.beforeChat.subscribe((ev) => {
    const { message, sender } = ev;
    if (!message.startsWith(cmdPrefix)) return;
    const cmd = message.slice(cmdPrefix.length);
    switch (cmd) {
        case "open":
            sender.addTag(EditorTag);
            sender.playSound("random.levelup");
            sender.tell("§l編集機能を追加しました\n§r§7スニーク中に{§b右クリックor長押し§7}で開く\n[§b!close§7]で終了");
            break;
        case "close":
            sender.removeTag(EditorTag);
            sender.playSound("random.levelup");
            sender.tell("§l終了しました");
            break;
    }
    ev.cancel = true;
});
function isPlayer(entity: Entity): entity is Player {
    return entity instanceof Player;
}
function isInventory(component: IEntityComponent): component is EntityInventoryComponent {
    return component instanceof EntityInventoryComponent;
}
