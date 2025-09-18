import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Link as LinkIcon, Youtube, ArrowLeft, Clipboard } from 'lucide-react'
import { useState } from 'react'
import { useAction } from 'convex/react'
import { api } from 'convex/_generated/api'
import { Id } from 'convex/_generated/dataModel'
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@/components/dropzone'

type InputType = 'default' | 'link' | 'youtube' | 'text'

interface SourceUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  articleId: Id<'articles'>
}

export const SourceUploadDialog = ({
  open,
  onOpenChange,
  articleId,
}: SourceUploadDialogProps) => {
  const [inputType, setInputType] = useState<InputType>('default')
  const [inputValue, setInputValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[] | undefined>()

  // const addWebUrl = useAction(api.files.addWebUrl)
  // const addYouTube = useAction(api.files.addYouTube)
  // const addText = useAction(api.files.addText)
  const addFile = useAction(api.files.addFile)

  const handleBack = () => {
    setInputType('default')
    setInputValue('')
  }

  const handleFileDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles?.[0]
    if (!file) return
    setIsSubmitting(true)
    setUploadedFiles(acceptedFiles)
    try {
      const mt = file.type || 'text/plain'
      const sourceType: 'pdf' | 'text' = mt.includes('pdf') ? 'pdf' : 'text'
      await addFile({
        filename: file.name,
        mimeType: mt,
        bytes: await file.arrayBuffer(),
        articleId,
        sourceType,
      })
      onOpenChange(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (!inputValue) return
    setIsSubmitting(true)
    try {
      // if (inputType === 'link') {
      //   await addWebUrl({ url: inputValue, articleId })
      // } else if (inputType === 'youtube') {
      //   await addYouTube({ url: inputValue, articleId })
      // } else if (inputType === 'text') {
      //   await addText({ text: inputValue, articleId })
      // }
      onOpenChange(false)
      handleBack()
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[900px] bg-slate-900 border border-slate-800'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold text-slate-100'>
            {inputType !== 'default' && (
              <Button
                onClick={handleBack}
                variant='ghost'
                size='icon'
                className='rounded-full mr-2'
              >
                <ArrowLeft className='h-4 w-4 text-slate-400' />
                <span className='sr-only'>Back</span>
              </Button>
            )}

            {inputType === 'default' && 'Add sources'}
            {inputType === 'link' && 'Add link'}
            {inputType === 'youtube' && 'YouTube URL'}
            {inputType === 'text' && 'Paste text'}
          </DialogTitle>
          <DialogDescription className='text-sm text-slate-400'>
            {inputType === 'default' ? (
              <>
                ArticleGen helps you transform your sources and supporting
                materials into engaging, story-driven draft articles.
                <br />
                Add your sources below to get started. (Examples: research
                notes, reference documents, articles, etc.)
              </>
            ) : inputType === 'youtube' ? (
              'Paste in a YouTube URL below to upload as a source in NotebookLM'
            ) : inputType === 'text' ? (
              'Paste or type your text below'
            ) : (
              'Enter a URL to add as a source'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className='mt-4'>
          {inputType === 'default' ? (
            <>
              <Dropzone
                accept={{
                  'application/pdf': ['.pdf'],
                  'text/plain': ['.txt'],
                }}
                disabled={isSubmitting}
                maxFiles={1}
                onDrop={handleFileDrop}
                src={uploadedFiles}
                className='rounded-lg border border-dashed border-slate-700 bg-slate-800/50 p-12'
              >
                <DropzoneEmptyState />
                <DropzoneContent />
              </Dropzone>

              <div className='mt-8 grid grid-cols-3 gap-4'>
                <Button
                  variant='outline'
                  className='w-full justify-start gap-2 border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-800 hover:text-slate-100'
                  onClick={() => setInputType('link')}
                >
                  <LinkIcon className='h-4 w-4' />
                  Link
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start gap-2 border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-800 hover:text-slate-100'
                  onClick={() => setInputType('youtube')}
                >
                  <Youtube className='h-4 w-4' />
                  YouTube
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start gap-2 border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-800 hover:text-slate-100'
                  onClick={() => setInputType('text')}
                >
                  <Clipboard className='h-4 w-4' />
                  Paste text
                </Button>
              </div>
            </>
          ) : inputType === 'text' ? (
            <div className='space-y-4'>
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder='Paste or type your text here...'
                className='min-h-[300px] resize-none bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500'
              />
              <Button
                className='w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                onClick={handleSubmit}
                disabled={!inputValue || isSubmitting}
              >
                Insert
              </Button>
            </div>
          ) : (
            <div className='space-y-4'>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  inputType === 'youtube' ? 'Paste YouTube URL' : 'Enter URL'
                }
                className='bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500'
              />
              <Button
                className='w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                onClick={handleSubmit}
                disabled={!inputValue || isSubmitting}
              >
                Insert
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
