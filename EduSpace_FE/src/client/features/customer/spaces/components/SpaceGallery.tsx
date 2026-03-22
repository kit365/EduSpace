import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface SpaceGalleryProps {
  images: string[];
}

export function SpaceGallery({ images }: SpaceGalleryProps) {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const galleryImages = safeImages.length > 0 ? safeImages : ['https://via.placeholder.com/1200x800?text=EduSpace'];

  const sideImages = [1, 2, 3, 4].map((index) => galleryImages[index] ?? galleryImages[index % galleryImages.length]);

  const openViewer = () => {
    setSelectedImage(0);
    setIsViewerOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-3 mb-8 md:h-[420px]">
        <div className="md:col-span-2 md:row-span-2 overflow-hidden rounded-3xl">
          <img
            src={galleryImages[selectedImage]}
            alt="Main space view"
            className="w-full h-full min-h-[260px] object-cover"
          />
        </div>

        {sideImages.map((image, index) => {
          const imageIndex = index + 1;
          const isLast = index === sideImages.length - 1;
          return (
            <div
              key={`${image}-${index}`}
              className="relative group cursor-pointer overflow-hidden rounded-2xl"
              onClick={() => setSelectedImage(imageIndex % galleryImages.length)}
            >
              <img
                src={image}
                alt={`Space view ${imageIndex + 1}`}
                className="w-full h-full min-h-[128px] object-cover group-hover:scale-[1.03] transition-transform duration-300"
              />

              {isLast && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openViewer();
                  }}
                  className="absolute bottom-3 right-3 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-gray-700 shadow-lg hover:bg-white"
                >
                  {t('customer.spaceDetail.gallery.viewAllPhotos', { count: galleryImages.length })}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {isViewerOpen && (
        <div className="fixed inset-0 z-[120] bg-black/75 p-4 sm:p-8">
          <div className="max-w-6xl mx-auto h-full flex flex-col gap-4">
            <div className="flex justify-end">
              <button
                onClick={() => setIsViewerOpen(false)}
                className="w-10 h-10 rounded-full bg-white/90 text-gray-800 flex items-center justify-center"
                aria-label={t('common.cancel')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden rounded-2xl">
              <img
                src={galleryImages[selectedImage]}
                alt="Selected space view"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  onClick={() => setSelectedImage(index)}
                  className={`overflow-hidden rounded-lg border-2 ${selectedImage === index ? 'border-white' : 'border-transparent'}`}
                >
                  <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-16 object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
