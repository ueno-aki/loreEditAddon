import { world, EntityQueryOptions } from "mojang-minecraft";

import { ModalFormData, ActionFormData } from "mojang-minecraft-ui";

//追加画面
const add = new ModalFormData()
                .title("追加")
                .textField("説明文","入力してね","")
                .toggle("保存する",true);

//並べ替え画面
const order = new ActionFormData()
                .title("移動")
                .button("一番上へ移動")
                .button("ひとつ上へ移動")
                .button("ひとつ下へ移動")
                .button("一番下へ移動")
                .button("キャンセル");

//
world.events.beforeItemUse.subscribe(itemUse => {

    const player = itemUse.source;

    if (player.isSneaking && player.hasTag("edit_player")){
        itemUse.cancel = true;

        //アイテム検知
        const option = new EntityQueryOptions();
        option.name = player.nameTag;
        const pList = Array.from(world.getPlayers(option));
        const pInventoryComp = pList[0].getComponent("minecraft:inventory");
        const pContainer = pInventoryComp.container;
        const itemStack = pContainer.getItem(pList[0].selectedSlot);
        let loreList = itemStack.getLore();

        //メインメニュー
        const mainMenu = new ActionFormData()
                            .title("メインメニュー")
                            .body("所持アイテム:" + itemStack.id)
                            .button("追加","textures/blocks/furnace_front_on")
                            .button("削除","textures/blocks/furnace_front_off")
                            .button("編集","textures/blocks/cartography_table_top")
                            .button("並び替え","textures/ui/item_container_transfer_mode");


        system(player);

        //並び替え（選択画面＋移動画面）
        function optSystem(names){
            const opt = new ActionFormData()
                .title("選択画面")
                .body("移動させたいものを選択");


            loreList.forEach(optElement => {
                opt.button(optElement);
            });

            opt.button("メインメニューに戻る");

            
            opt.show(names).then((option) => {
                //メインメニューに戻る
                if (option.selection === loreList.length){
                    system(player);
                }
                for (let j = 0; j < loreList.length; j++){

                    if (option.selection === j){
                        order.show(names).then((ord) => {

                            let list = loreList;

                            switch(ord.selection){
                                case 0://一番上へ移動
                                    list.splice(0,0,list[j]);
                                    list.splice(j + 1,1);
                                    itemStack.setLore(list);
                                    pContainer.setItem(pList[0].selectedSlot, itemStack);
                                    optSystem(player);
                                    break;

                                case 1://ひとつ上へ移動
                                    if (j > 0){
                                        list.splice(j - 1,0,list[j]);
                                        list.splice(j + 1,1);
                                        itemStack.setLore(list);
                                        pContainer.setItem(pList[0].selectedSlot, itemStack);
                                    }
                                    optSystem(player);
                                    break;

                                case 2://ひとつ下へ移動
                                    if (j < list.length){
                                        list.splice(j + 2,0,list[j]);
                                        list.splice(j,1);
                                        itemStack.setLore(list);
                                        pContainer.setItem(pList[0].selectedSlot, itemStack);
                                    }
                                    optSystem(player);
                                    break;

                                case 3://一番下へ移動
                                    list.push(list[j]);
                                    list.splice(j,1);
                                    itemStack.setLore(list);
                                    pContainer.setItem(pList[0].selectedSlot, itemStack);
                                    optSystem(player);
                                    break;

                                case 4://並び替え選択画面へ遷移
                                    optSystem(player);
                                    break;    
                            }
                        });
                    }
                }
            });
        }

        //削除画面
        function delSystem(names){
            const del = new ActionFormData()
                                        .title("削除")
                                        .body("削除したいものを選択");
    
            loreList.forEach(delElement => {
                del.button(delElement,"textures/ui/icon_sign");
            });

            del.button("メインメニューに戻る");
    
            del.show(names).then((deletion) => {
                if (deletion.selection === loreList.length){
                    system(player);
                }
                for (let i = 0; i < loreList.length; i++){

                    if (deletion.selection === i){
                        let list = loreList;
                        list.splice(i,1);
                        itemStack.setLore(list);
                        pContainer.setItem(pList[0].selectedSlot, itemStack);
                        delSystem(player);
                    }
                }
            });
        }

        //追加画面
        function addSystem(names){
            add.show(names).then((addition) => {

                if (addition.formValues[1]){
                    loreList.push(addition.formValues[0]);
                    itemStack.setLore(loreList);
                    pContainer.setItem(pList[0].selectedSlot, itemStack);
                }

                system(player);
            });
        }

        //編集画面
        function editSystem(names){
            const edit = new ModalFormData()
                            .title("編集");
    
            loreList.forEach(editElement =>{
                edit.textField("","入力してね",editElement);
            });
    
            edit.show(names).then((editing) => {
                loreList = editing.formValues;
                itemStack.setLore(loreList);
                pContainer.setItem(pList[0].selectedSlot, itemStack);

                system(player);
    
            });
        }

        //メインメニュー
        function system(names){
            mainMenu.show(names).then((responce) => {

                switch(responce.selection){
                    case 0:
                        addSystem(player);
                        break;
                    
                    case 1:
                        delSystem(player);
                        break;
    
                    case 2:
                        editSystem(player);
                        break;
                    
                    case 3:
                        optSystem(player);
                        break;
                }            
            });
        }
    }
});


world.events.beforeChat.subscribe(chatEv => {
    if(chatEv.message == "!open"){
        chatEv.cancel = true;
        chatEv.sender.addTag("edit_player");
        chatEv.sender.runCommand("playsound random.levelup @s");
        chatEv.sender.runCommand("tellraw @s {\"rawtext\":[{\"text\":\"─────────────────────────────────\\n<<<§l編集機能を追加しました§r>>>\"}]}");
        chatEv.sender.runCommand("tellraw @s {\"rawtext\":[{\"text\":\"§lスニーク中に{§b右クリックor長押し§f}で開く\\n§b!close§fで終了§r\\n─────────────────────────────────\"}]}");

    };

    if(chatEv.message == "!close"){
        chatEv.cancel = true;
        chatEv.sender.removeTag("edit_player");
        chatEv.sender.runCommand("playsound random.levelup @s");
        chatEv.sender.runCommand("tellraw @s {\"rawtext\":[{\"text\":\"<<<§l終了しました§r>>>\"}]}");
    }
}) 

                
