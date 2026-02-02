import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ImageRepositoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectImage: (imageUrl: string) => void;
}

// Sample image repository - in a real app, this would come from an API or database
const IMAGE_REPOSITORY = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
    title: 'Mathematics',
    category: 'Education'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
    title: 'Science Lab',
    category: 'Education'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400',
    title: 'Books',
    category: 'Education'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
    title: 'Technology',
    category: 'Education'
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400',
    title: 'Library',
    category: 'Education'
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    title: 'Classroom',
    category: 'Education'
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400',
    title: 'Globe',
    category: 'Geography'
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
    title: 'Graduation',
    category: 'Education'
  },
];

export const ImageRepositoryDialog = ({
  open,
  onOpenChange,
  onSelectImage,
}: ImageRepositoryDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredImages = IMAGE_REPOSITORY.filter(
    (image) =>
      image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageSelect = (imageUrl: string) => {
    onSelectImage(imageUrl);
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Image Repository</DialogTitle>
          <DialogDescription>
            Select an image from the repository to insert into your content
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search images by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="flex-1 rounded-md border">
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => handleImageSelect(image.url)}
                    className="group relative overflow-hidden rounded-lg border-2 border-transparent hover:border-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <p className="text-sm font-semibold truncate">{image.title}</p>
                        <p className="text-xs text-white/80">{image.category}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {filteredImages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Search className="w-12 h-12 mb-2 opacity-50" />
                  <p className="text-sm">No images found</p>
                  <p className="text-xs">Try a different search term</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
