type ErrorWindowProps = {
  message: string;
  spinner?: boolean;
};

export default function ErrorWindow({
  message,
  spinner = false,
}: ErrorWindowProps) {
  return (
    <div className="flex items-center justify-center min-h-screen z-100 fixed top-0 left-0 right-0 bottom-0 bg-background/90 backdrop-blur-sm">
      <div className="text-center">
        <p className="text-muted-foreground mb-4">{message}</p>
        {spinner && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        )}
      </div>
    </div>
  );
}
