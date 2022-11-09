import { Player, world, EntityInventoryComponent, Vector } from "@minecraft/server";
import { showMainMenu } from "./Form/ContainerMenu/index";
import { Schedule } from "./TimeHandler/TimeHandler";
world.events.beforeItemUseOn.subscribe((ev) => {
    const { blockLocation, source, item } = ev;
    const block = source.dimension.getBlock(blockLocation);
    if (block.typeId === "minecraft:chest" || block.typeId === "minecraft:brewing_stand") {
        ev.cancel = true;
        showMainMenu(<Player>source);
    }
});
world.events.blockBreak.subscribe(({ player }) => {
    const y = Schedule.repeat(tell, 20, -1, "a", player)
        .then(() => {
            world.say("ok" + `${new Date().getTime()}`);
        })
        .then(() => {
            world.say("i");
        });
    Schedule.delay(() => {
        y.cancel();
    }, 60);
});
function tell(message: string, target: Player) {
    target.tell(message + `${new Date().getTime()}`);
}
