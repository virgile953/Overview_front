export default function Legend() {
  return (
    <div className="bg-sidebar-accent border border-border rounded-lg p-4 mb-4">
      <h3 className="text-sm font-medium text-foreground mb-2">Device Status Legend:</h3>
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border bg-emerald-600/50 border-emerald-600 rounded"></div>
          <span className="text-muted-foreground">Database + Live (Recently active)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border bg-blue-600/50 border-blue-600 rounded"></div>
          <span className="text-muted-foreground">Database only (Offline)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border bg-yellow-600/50 border-yellow-600 rounded"></div>
          <span className="text-muted-foreground">Cache only (Not in database)</span>
        </div>
      </div>
    </div>
  )
}