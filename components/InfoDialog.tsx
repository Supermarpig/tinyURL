import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";

const customString = (maxLength: number, message: string) =>
    z.string().refine(value => {
        let length = 0;
        for (let i = 0; i < value.length; i++) {
            const charCode = value.charCodeAt(i);
            if (charCode >= 0 && charCode <= 128) {
                length += 1;  // 英文字符
            } else {
                length += 2;  // 中文字符
            }
        }
        return length <= maxLength;
    }, { message });

const schema = z.object({
    title: customString(60, "Title must be 60 English characters or 30 Chinese characters or less"),
    description: customString(200, "Description must be 200 English characters or 100 Chinese characters or less"),
    imageUrl: z.string().url("Must be a valid URL").or(z.string().max(0, "Must be a valid URL or empty")),
});

type FormData = z.infer<typeof schema>;

interface InfoDialogProps {
    onSubmit: (data: FormData) => void;
    initialValues: FormData;
}

const InfoDialog: React.FC<InfoDialogProps> = ({ onSubmit, initialValues }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset, trigger, control } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: initialValues,
    });

    const [imageError, setImageError] = useState<string | null>(null);

    const checkImage = (url: string): Promise<{ width: number, height: number }> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                if (img.width >= 600 && img.height >= 315) {
                    resolve({ width: img.width, height: img.height });
                } else {
                    reject(new Error("Image dimensions are too small. Minimum dimensions are 600x315 pixels."));
                }
            };
            img.onerror = () => reject(new Error("Invalid image URL or unable to load the image."));
            img.src = url;
        });
    };

    const submitForm = async (data: FormData) => {
        setImageError(null);
        if (data.imageUrl) {
            try {
                const response = await fetch(data.imageUrl, {
                    redirect: 'follow'
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const blob = await response.blob();
                if (blob.size > 5 * 1024 * 1024) {
                    throw new Error("Image file size exceeds 5MB");
                }
                const imageUrlObject = URL.createObjectURL(blob);
                await checkImage(imageUrlObject);
                URL.revokeObjectURL(imageUrlObject);  // 釋放URL對象
            } catch (error) {
                if (error instanceof Error) {
                    setImageError(error.message);
                } else {
                    setImageError("An unknown error occurred.");
                }
                return;
            }
        }
        onSubmit(data);
        setIsOpen(false);
    };

    // 當初始值變化時重置表單
    useEffect(() => {
        reset(initialValues);
    }, [reset]);

    // 實時驗證
    const watchFields = useWatch({ control });

    useEffect(() => {
        trigger();
    }, [watchFields, trigger]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="default" className="mt-4 mb-4 w-full rounded">Add More Info</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>More Information</DialogTitle>
                    <DialogDescription>Fill in the additional details for the URL.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(submitForm)} className="flex flex-col space-y-4">
                    <div>
                        <input
                            type="text"
                            {...register("title")}
                            placeholder="Title"
                            className="border p-2 rounded w-full bg-gray-100 pixel-art-input"
                            onBlur={() => trigger("title")}
                        />
                        {errors.title && <p className="text-red-600">{errors.title.message}</p>}
                    </div>
                    <div>
                        <textarea
                            {...register("description")}
                            placeholder="Description"
                            className="border p-2 rounded w-full bg-gray-100 pixel-art-input"
                            onBlur={() => trigger("description")}
                        />
                        {errors.description && <p className="text-red-600">{errors.description.message}</p>}
                    </div>
                    <div>
                        <input
                            type="url"
                            {...register("imageUrl")}
                            placeholder="Image URL"
                            className="border p-2 rounded w-full bg-gray-100 pixel-art-input"
                            onBlur={() => trigger("imageUrl")}
                        />
                        {errors.imageUrl && <p className="text-red-600">{errors.imageUrl.message}</p>}
                        {imageError && <p className="text-red-600">{imageError}</p>}
                    </div>
                    <DialogFooter>
                        <Button>Done</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default InfoDialog;
