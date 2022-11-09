const BPFolderName = "myFirstScript"; //Change to your Addons Name

const [node, file, arg1] = process.argv;
const esbuild = require("esbuild");
const os = require("os");
const fs = require("fs-extra");

const mcdir =
    os.homedir() +
    "/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/development_behavior_packs/";
const outFolder = "build/" + BPFolderName + "/scripts/";
/** @type {esbuild.BuildOptions} */
const options = {
    bundle: true,
    outfile: outFolder + "main.js",
    target: "es6",
    format: "esm",
    minifyIdentifiers: true,
    minifyWhitespace: true,
    minifySyntax: true,
    entryPoints: ["scripts/main.ts"],
    tsconfig: "tsconfig.json",
    external: ["@minecraft/server", "@minecraft/server-ui"],
};
if (arg1 === "watch") {
    options.watch = {
        onRebuild(err, res) {
            if (err) {
                console.error(err);
            } else {
                deployMCFolder();
            }
        },
    };
}
fs.emptyDir("./build/").then(() => {
    fs.copySync("./behavior_packs/template", "./build/" + BPFolderName);
    esbuild
        .build(options)
        .then(() => {
            console.log(`success build [${new Date().getTime()}]`);
            deployMCFolder();
        })
        .catch((e) => {
            console.error(e);
        });
});

function deployMCFolder() {
    fs.copy("./build/" + BPFolderName, mcdir + BPFolderName, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log(`Deploying "${BPFolderName}" to "${mcdir}${BPFolderName}" [${new Date().getTime()}]`);
        }
    });
}
