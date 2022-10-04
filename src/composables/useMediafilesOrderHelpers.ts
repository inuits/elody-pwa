import { MediaFile } from "@/queries";

type orderDiff = {
    id: string,
    order: number,
};

let diffArray: orderDiff[] = [];

export const getDiffArray = (): orderDiff[] => {
    return diffArray;
};

export const compareMediafileOrder = (newArray: MediaFile[]): orderDiff[] => {
    const diff: orderDiff[] = [];
    newArray.forEach((mediafile: MediaFile) => {
        const order: number = newArray.indexOf(mediafile);
        diff.push({id: mediafile._id, order});
    });
    diffArray = diff;
    return diff;
};

export const removeMediafilesFromOrdering = (toBeDeleted: String[]) => {
    toBeDeleted.forEach((id) => {
        let index = -1;
        let decrementOrder: boolean = false;
        let eraseIndex: number = -1;
        diffArray.forEach((mediafile) => {
            index++;
            if(decrementOrder){
                diffArray[index].order -= 1 ;
            }

            if(id === mediafile.id){
                eraseIndex = index;
                decrementOrder = true;
            }
        });
        diffArray.splice(eraseIndex, 1);
    });
};

const useMediafilesOrderHelpers = () => {
    return {
        compareMediafileOrder,
        removeMediafilesFromOrdering,
        getDiffArray
    };
};

export default useMediafilesOrderHelpers;