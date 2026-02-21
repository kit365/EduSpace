import { useState } from 'react';

interface SpaceGalleryProps {
  images: string[];
}

export function SpaceGallery({ images }: SpaceGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      <div className="col-span-2 row-span-2">
        <img
          src={images[selectedImage]}
          alt="Main space view"
          className="w-full h-full object-cover rounded-2xl"
        />
      </div>
      {images.slice(1, 4).map((image, index) => (
        <div 
          key={index} 
          className="relative group cursor-pointer" 
          onClick={() => setSelectedImage(index + 1)}
        >
          <img
            src={image}
            alt={`Space view ${index + 2}`}
            className="w-full h-48 object-cover rounded-xl group-hover:opacity-90 transition"
          />
        </div>
      ))}
      <div className="relative">
        <img
          src={images[0]}
          alt="Space view 5"
          className="w-full h-48 object-cover rounded-xl cursor-pointer hover:opacity-90 transition"
          onClick={() => setSelectedImage(0)}
        />
      </div>
    </div>
  );
}
