import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "./ui/button"

interface TinyUrlMoreInfoProps {
    shortUrl : string;
}

const TinyUrlMoreInfo: React.FC<TinyUrlMoreInfoProps> = ({ shortUrl }) => {
    return (
        <Drawer>
            <DrawerTrigger>
                <Button className="ml-2 p-2 bg-gray-100 border border-black pixel-art-button ">Open Detail</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{shortUrl}</DrawerTitle>
                    <DrawerDescription>some details</DrawerDescription>
                </DrawerHeader>
                
                <DrawerFooter>
                    {/* <Button>Submit</Button> */}
                    <DrawerClose>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default TinyUrlMoreInfo