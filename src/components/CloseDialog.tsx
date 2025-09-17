import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

type CloseDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  disablePrompt: boolean
  onDisablePromptChange: (disabled: boolean) => void
}

export default function CloseDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  disablePrompt, 
  onDisablePromptChange 
}: CloseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close modified file?</DialogTitle>
          <DialogDescription>
            This file has unsaved changes. Are you sure you want to close it? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="disable-prompt" 
            checked={disablePrompt}
            onCheckedChange={(checked: boolean) => onDisablePromptChange(checked)}
          />
          <Label htmlFor="disable-prompt" className="text-sm">
            Don't ask again this session
          </Label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Close file
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
