'use client'

import { useState } from 'react'

interface Subtitle {
  id: string
  start: number
  end: number
  text: string
}

interface Clip {
  id: string
  start: number
  end: number
  duration: number
  subtitles: Subtitle[]
}

export default function VideoProcessor() {
  const [videoUrl, setVideoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [currentClip, setCurrentClip] = useState<Clip | null>(null)
  const [allClips, setAllClips] = useState<Clip[]>([])
  const [currentClipIndex, setCurrentClipIndex] = useState(0)
  const [error, setError] = useState('')
  const [editingSubtitle, setEditingSubtitle] = useState<string | null>(null)
  const [editedText, setEditedText] = useState('')

  const handleProcessVideo = async () => {
    if (!videoUrl.trim()) {
      setError('Please enter a video URL')
      return
    }

    setIsLoading(true)
    setError('')
    setLoadingMessage('Fetching video and analyzing...')

    try {
      // Step 1: Fetch video info and transcribe via Supadata
      setLoadingMessage('Transcribing audio with Supadata...')
      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl })
      })

      if (!transcribeResponse.ok) {
        throw new Error('Failed to transcribe video')
      }

      const transcribeData = await transcribeResponse.json()
      
      // Step 2: Translate to English via Google AI Studio
      setLoadingMessage('Translating to English with Google AI Studio...')
      const translateResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          segments: transcribeData.segments 
        })
      })

      if (!translateResponse.ok) {
        throw new Error('Failed to translate subtitles')
      }

      const translateData = await translateResponse.json()
      
      // Step 3: Split into clips if video > 1 minute
      setLoadingMessage('Creating clips...')
      const totalDuration = transcribeData.duration
      const clips = createClips(translateData.segments, totalDuration)
      
      setAllClips(clips)
      setCurrentClip(clips[0])
      setCurrentClipIndex(0)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  const createClips = (segments: any[], totalDuration: number): Clip[] => {
    const clips: Clip[] = []
    const targetDuration = 60 // 1 minute
    let currentTime = 0
    let clipIndex = 0

    while (currentTime < totalDuration) {
      const clipEnd = Math.min(currentTime + targetDuration, totalDuration)
      
      // Filter segments for this clip
      const clipSegments = segments.filter(
        seg => seg.start >= currentTime && seg.end <= clipEnd
      )

      // Adjust timestamps to be relative to clip start
      const adjustedSubtitles: Subtitle[] = clipSegments.map((seg, idx) => ({
        id: `subtitle-${clipIndex}-${idx}`,
        start: seg.start - currentTime,
        end: seg.end - currentTime,
        text: seg.text
      }))

      clips.push({
        id: `clip-${clipIndex}`,
        start: currentTime,
        end: clipEnd,
        duration: clipEnd - currentTime,
        subtitles: adjustedSubtitles
      })

      currentTime = clipEnd
      clipIndex++
    }

    return clips
  }

  const handleManualTrim = (newStart: number, newEnd: number) => {
    if (!currentClip) return

    const updatedClip = {
      ...currentClip,
      start: newStart,
      end: newEnd,
      duration: newEnd - newStart,
      subtitles: currentClip.subtitles.filter(
        sub => sub.start >= newStart && sub.end <= newEnd
      ).map(sub => ({
        ...sub,
        start: sub.start - newStart,
        end: sub.end - newStart
      }))
    }

    setCurrentClip(updatedClip)
    const updatedClips = [...allClips]
    updatedClips[currentClipIndex] = updatedClip
    setAllClips(updatedClips)
  }

  const handleSubtitleEdit = (subtitleId: string, newText: string) => {
    if (!currentClip) return

    const updatedSubtitles = currentClip.subtitles.map(sub =>
      sub.id === subtitleId ? { ...sub, text: newText } : sub
    )

    const updatedClip = { ...currentClip, subtitles: updatedSubtitles }
    setCurrentClip(updatedClip)
    
    const updatedClips = [...allClips]
    updatedClips[currentClipIndex] = updatedClip
    setAllClips(updatedClips)
    
    setEditingSubtitle(null)
    setEditedText('')
  }

  const getCurrentSubtitle = (currentTime: number): Subtitle | null => {
    if (!currentClip) return null
    return currentClip.subtitles.find(
      sub => currentTime >= sub.start && currentTime <= sub.end
    ) || null
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* URL Input Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Enter Video URL</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleProcessVideo}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Process Video'}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Loading Screen */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-md p-8 mb-6 text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">{loadingMessage}</p>
        </div>
      )}

      {/* Video Player and Subtitles */}
      {currentClip && !isLoading && (
        <div className="space-y-6">
          {/* Clip Navigation */}
          {allClips.length > 1 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Clips ({allClips.length})</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (currentClipIndex > 0) {
                        setCurrentClipIndex(currentClipIndex - 1)
                        setCurrentClip(allClips[currentClipIndex - 1])
                      }
                    }}
                    disabled={currentClipIndex === 0}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1">
                    {currentClipIndex + 1} / {allClips.length}
                  </span>
                  <button
                    onClick={() => {
                      if (currentClipIndex < allClips.length - 1) {
                        setCurrentClipIndex(currentClipIndex + 1)
                        setCurrentClip(allClips[currentClipIndex + 1])
                      }
                    }}
                    disabled={currentClipIndex === allClips.length - 1}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Video Player */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="video-container">
              <video
                key={currentClip.id}
                controls
                playsInline
                className="w-full"
                onTimeUpdate={(e) => {
                  const video = e.currentTarget
                  const currentTime = video.currentTime
                  // Subtitle display is handled by the native WebVTT track
                }}
              >
                <source 
                  src={`${videoUrl}#t=${currentClip.start},${currentClip.end}`} 
                  type="video/mp4" 
                />
                <track
                  kind="subtitles"
                  label="English"
                  srcLang="en"
                  default
                />
              </video>
            </div>

            {/* Manual Trim Controls */}
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h4 className="font-semibold mb-2">Manual Trim</h4>
              <div className="flex gap-4 items-center">
                <div>
                  <label className="block text-sm text-gray-600">Start (s)</label>
                  <input
                    type="number"
                    value={currentClip.start.toFixed(2)}
                    onChange={(e) => handleManualTrim(
                      parseFloat(e.target.value),
                      currentClip.end
                    )}
                    className="w-24 px-2 py-1 border rounded"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">End (s)</label>
                  <input
                    type="number"
                    value={currentClip.end.toFixed(2)}
                    onChange={(e) => handleManualTrim(
                      currentClip.start,
                      parseFloat(e.target.value)
                    )}
                    className="w-24 px-2 py-1 border rounded"
                    step="0.1"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  Duration: {currentClip.duration.toFixed(2)}s
                </div>
              </div>
            </div>
          </div>

          {/* Subtitle Editor */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Subtitles</h3>
            <div className="space-y-3">
              {currentClip.subtitles.map((subtitle) => (
                <div
                  key={subtitle.id}
                  className="p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
                >
                  {editingSubtitle === subtitle.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="w-full p-2 border rounded"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSubtitleEdit(subtitle.id, editedText)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingSubtitle(null)
                            setEditedText('')
                          }}
                          className="px-3 py-1 bg-gray-300 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">
                          {subtitle.start.toFixed(2)}s - {subtitle.end.toFixed(2)}s
                        </div>
                        <div className="text-gray-800">{subtitle.text}</div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingSubtitle(subtitle.id)
                          setEditedText(subtitle.text)
                        }}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Download Options */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Export</h3>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  // Download current clip as video
                  window.open(`${videoUrl}#t=${currentClip.start},${currentClip.end}`, '_blank')
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Download Clip
              </button>
              <button
                onClick={() => {
                  // Download subtitles as VTT
                  const vttContent = generateVTT(currentClip.subtitles)
                  downloadFile(vttContent, 'subtitles.vtt', 'text/vtt')
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Download VTT
              </button>
              <button
                onClick={() => {
                  // Download subtitles as SRT
                  const srtContent = generateSRT(currentClip.subtitles)
                  downloadFile(srtContent, 'subtitles.srt', 'text/plain')
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Download SRT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function generateVTT(subtitles: Subtitle[]): string {
  let vtt = 'WEBVTT\n\n'
  subtitles.forEach((sub, index) => {
    const startTime = formatVTTTime(sub.start)
    const endTime = formatVTTTime(sub.end)
    vtt += `${index + 1}\n${startTime} --> ${endTime}\n${sub.text}\n\n`
  })
  return vtt
}

function formatVTTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${secs.toFixed(3).padStart(6, '0')}`
}

function generateSRT(subtitles: Subtitle[]): string {
  let srt = ''
  subtitles.forEach((sub, index) => {
    const startTime = formatSRTTime(sub.start)
    const endTime = formatSRTTime(sub.end)
    srt += `${index + 1}\n${startTime} --> ${endTime}\n${sub.text}\n\n`
  })
  return srt
}

function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
