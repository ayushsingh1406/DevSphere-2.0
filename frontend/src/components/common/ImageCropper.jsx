import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import Button from '../ui/Button';
import GlassCard from './GlassCard';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onRotationChange = (rotation) => {
    setRotation(rotation);
  };

  const onCropCompleteInternal = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(
        image,
        croppedAreaPixels,
        rotation
      );
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels, rotation, image, onCropComplete]);

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl">
        <GlassCard className="overflow-hidden border-white/10 shadow-2xl">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h3 className="text-sm font-black text-[#f8f6f3] uppercase tracking-widest">Crop Profile Picture</h3>
            <button onClick={onCancel} className="text-[#8d807c] hover:text-[#f8f6f3] transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="relative h-96 w-full bg-[#0a0a0a]">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteInternal}
              onZoomChange={onZoomChange}
              onRotationChange={onRotationChange}
              classes={{
                containerClassName: "bg-[#0a0a0a]",
                mediaClassName: "max-w-none",
                cropAreaClassName: "border-2 border-[#edc390] shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] rounded-full"
              }}
            />
          </div>

          <div className="p-6 space-y-6 bg-white/[0.02]">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <ZoomOut size={16} className="text-[#8d807c]" />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-[#edc390]"
                />
                <ZoomIn size={16} className="text-[#edc390]" />
              </div>

              <div className="flex items-center gap-4">
                <RotateCw size={16} className="text-[#8d807c]" />
                <input
                  type="range"
                  value={rotation}
                  min={0}
                  max={360}
                  step={1}
                  aria-labelledby="Rotation"
                  onChange={(e) => setRotation(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-[#e7380d]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={onCancel} className="text-xs uppercase tracking-widest">
                Cancel
              </Button>
              <Button onClick={showCroppedImage} className="text-xs uppercase tracking-widest bg-[#edc390] text-[#1d1917] hover:bg-[#f8f6f3]">
                Apply Crop
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ImageCropper;
