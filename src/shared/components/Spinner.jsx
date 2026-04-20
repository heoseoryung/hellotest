export default function Spinner({ fullscreen = false }) {
  if (fullscreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-[#3ea76e] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  return (
    <div className="flex items-center justify-center py-10">
      <div className="w-8 h-8 border-4 border-[#3ea76e] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
