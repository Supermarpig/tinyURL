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
import { buttonVariants } from "./ui/button"
import { cn } from "@/lib/utils";

interface TinyUrlMoreInfoProps {
    shortUrl: string;
    visits: any[] | null;
}

const TinyUrlMoreInfo: React.FC<TinyUrlMoreInfoProps> = ({ shortUrl, visits }) => {

    return (
        <Drawer>
            <DrawerTrigger className={cn(buttonVariants())}>
                Open Detail
                {/* <button className="ml-2 p-2 bg-gray-100 border border-black pixel-art-button">Open Detail</button> */}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{shortUrl}</DrawerTitle>
                    <DrawerDescription>More detailed information about this short URL</DrawerDescription>
                </DrawerHeader>
                <div className="mt-4">
                    {visits && visits.length > 0 ? (
                        <div>
                            {visits.map((visit, index) => (
                                <div key={index} className="mb-4">
                                    <p><strong>Access Time:</strong> {new Date(visit.date).toLocaleString()}</p>
                                    <p><strong>Referrer:</strong> {visit.referrer}</p>
                                    <p><strong>User Agent:</strong> {visit.userAgent}</p>
                                    <p><strong>IP Address:</strong> {visit.ipAddress}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Loading details...</p>
                    )}
                </div>
                <DrawerFooter>
                    <DrawerClose className={cn(buttonVariants())}>
                        Cancel
                        {/* <button className="ml-2 p-2 bg-gray-100 border border-black pixel-art-button">Cancel</button> */}
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default TinyUrlMoreInfo;