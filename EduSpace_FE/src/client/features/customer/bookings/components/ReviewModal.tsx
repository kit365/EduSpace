import { useState } from "react";
import { Star } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "../../../../../components/ui/dialog";
import { Button } from "../../../../../components/ui/button";

interface ReviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (rating: number, comment: string) => void;
    spaceName?: string;
}

export function ReviewModal({ open, onOpenChange, onSubmit, spaceName }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    const handleSubmit = () => {
        if (!rating || !comment.trim()) return;
        onSubmit(rating, comment);
        setRating(0);
        setComment("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-gray-900">
                        Đánh giá không gian
                    </DialogTitle>
                    <DialogDescription className="text-sm font-medium text-gray-500">
                        Chia sẻ trải nghiệm của bạn tại {spaceName || 'phòng học này'}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {/* Star Rating */}
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-bold text-gray-500">Chất lượng dịch vụ</span>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className="transition-all hover:scale-110 active:scale-95 focus:outline-none"
                                >
                                    <Star
                                        className={`w-10 h-10 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} transition-colors`}
                                    />
                                </button>
                            ))}
                        </div>
                        <span className="text-sm font-black text-amber-500 h-5">
                            {rating > 0 ? `${rating}/5 sao` : ''}
                        </span>
                    </div>

                    {/* Comment Area */}
                    <div className="space-y-2">
                        <span className="text-sm font-bold text-gray-700">Chi tiết trải nghiệm (tuỳ chọn)</span>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Chia sẻ cảm nhận của bạn về không gian, tiện ích, Host..."
                            className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm font-medium resize-none shadow-sm"
                        />
                    </div>
                </div>

                <DialogFooter className="sm:justify-between gap-3 flex-col sm:flex-row">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl font-bold py-6 sm:py-2 border-gray-200"
                    >
                        Để sau
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!rating}
                        className="rounded-xl font-black py-6 sm:py-2 bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                        Gửi đánh giá
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
