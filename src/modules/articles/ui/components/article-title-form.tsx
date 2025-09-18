'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { api } from 'convex/_generated/api'
import { Id } from 'convex/_generated/dataModel'

interface ArticleTitleFormProps {
  articleId: Id<'articles'>
  initialTitle: string
}

export const ArticleTitleForm = ({
  articleId,
  initialTitle,
}: ArticleTitleFormProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const update = useMutation(api.articles.updateTitle)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleTitleSubmit = async () => {
    if (title === initialTitle) {
      setIsEditing(false)
      return
    }

    if (title.trim().length === 0) {
      toast.warning('Title cannot be empty.')
      setTitle(initialTitle) // Revert to the initial title
      setIsEditing(false)
      return
    }

    if (title.trim().length < 10) {
      toast.warning('Title must be at least 10 characters long.')
      return // Keep editing mode active
    }

    const promise = update({ id: articleId, title: title.trim() })

    toast.promise(promise, {
      loading: 'Updating title...',
      success: 'Title updated!',
      error: 'Failed to update title.',
    })

    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <Input
        value={title}
        onChange={handleTitleChange}
        onBlur={handleTitleSubmit}
        autoFocus
        className='text-xl font-medium bg-transparent border-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0  h-auto text-white'
      />
    )
  }

  return (
    <h1
      className='text-xl font-medium cursor-pointer'
      onClick={() => setIsEditing(true)}
    >
      {initialTitle}
    </h1>
  )
}
