import { MediaFile } from "@/queries";

type orderDiff = {
    index: number,
    order: number,
};

export const compareMediafileOrder = (originalArray: MediaFile[], newArray: MediaFile[]): orderDiff[] => {
    const diff: orderDiff[] = [];

    newArray.forEach((mediafile: any) => {
        const order: number = newArray.indexOf(mediafile);
        const index: number = originalArray.indexOf(mediafile);
        if (order !== index){
            diff.push({index, order});
        }
    });

    return diff;
};

const useMediafilesOrderHelpers = () => {
    return {
        compareMediafileOrder,
    };
};

export default useMediafilesOrderHelpers;