interface HomePageProps {
    uploadOpen: boolean;
    setUploadOpen: (open: boolean) => void;
  }
  
  export default function HomePage({ uploadOpen: _uploadOpen, setUploadOpen: _setUploadOpen }: HomePageProps) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-[var(--text-secondary)]">Home Page — coming in Step 6</p>
      </div>
    );
  }