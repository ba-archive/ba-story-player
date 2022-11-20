import { Dict } from "@/types/common"
import { Loader, LoaderResource } from "pixi.js"

const spineLoader=new Loader()
let loadRes:Dict<LoaderResource>
function setLoadRes(res:Dict<LoaderResource>) {
  loadRes=res 
}
function getLoadRes(){
  return loadRes
}
export default spineLoader
export {setLoadRes,getLoadRes}