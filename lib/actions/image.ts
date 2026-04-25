"use server"
import path from "path"
import fsp from "fs/promises";

export async function uploadImage(name: string, image: string, folder?: string) {
    const uploadDir = path.join(process.cwd(), "/public/uploads" + folder)
    
    if (folder) {
        let folders = folder.split("/")
        for (let i = 0; i < folders.length; i++) {
            let string = i > 0 ? "/" + folders.slice(0, i).join("/") : ""
            try {
                await fsp.readdir(path.join(process.cwd() + "/public/uploads" + string, folders[i]))
            } catch (err) {
                await fsp.mkdir(path.join(process.cwd() + "/public/uploads" + string, folders[i]))
            }
        }
    }

    var ext = image.split(';')[0].match(/jpeg|png|gif|webp|jpg/)![0];

    const getFileName = (name: string) => Date.now().toString() + "_" + name.replaceAll(" ", "_").split(".")[0] + "." + ext;

    var data = image.replace(/^data:image\/\w+;base64,/, "");
    var buf = Buffer.from(data, 'base64');
    let fileName = getFileName(name);

    fsp.writeFile(uploadDir + "/" + fileName, buf)

    return fileName;
}

export async function removeImage(name: string, folder?: string) {
    const uploadDir = path.join(process.cwd(), "/public/uploads" + folder + "/" + name)
    await fsp.rm(uploadDir, { force: true, maxRetries: 3 })
}