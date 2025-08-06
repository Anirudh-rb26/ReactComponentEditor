"use client"

import React, { useState } from "react"
import { ComponentEditor } from "@/components/component-editor"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code2, Eye } from 'lucide-react'

const EXAMPLE_COMPONENT = `function ExampleComponent() {
  return React.createElement('div', {
    'data-v0-id': 'main-container',
    className: 'p-8 rounded-lg border',
    style: { backgroundColor: '#f8f9fa', padding: '32px' }
  }, [
    React.createElement('h1', {
      key: 'title',
      'data-v0-id': 'heading-welcome',
      className: 'text-2xl font-bold mb-4',
      style: { color: '#1a1a1a', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }
    }, 'Welcome to React Editor'),
    React.createElement('p', {
      key: 'description',
      'data-v0-id': 'paragraph-description',
      className: 'mb-4',
      style: { color: '#666666', fontSize: '16px', marginBottom: '16px' }
    }, 'This is an example component you can edit visually.'),
    React.createElement('button', {
      key: 'cta-button',
      'data-v0-id': 'button-get-started',
      className: 'px-4 py-2 rounded',
      style: { backgroundColor: '#C96442', color: 'white', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer' }
    }, 'Get Started'),
    React.createElement('div', {
      key: 'features-card',
      'data-v0-id': 'features-card',
      className: 'mt-6 p-4 rounded border',
      style: { marginTop: '24px', padding: '16px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' }
    }, [
      React.createElement('h2', {
        key: 'features-title',
        'data-v0-id': 'heading-features',
        className: 'text-lg font-semibold mb-2',
        style: { color: '#C96442', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }
      }, 'Key Features'),
      React.createElement('ul', {
        key: 'features-list',
        'data-v0-id': 'list-features',
        className: 'space-y-1',
        style: { listStyle: 'none', padding: '0' }
      }, [
        React.createElement('li', { 
          key: 'f1',
          'data-v0-id': 'list-item-1',
          style: { color: '#555555', fontSize: '14px', marginBottom: '4px' }
        }, 'Visual editing interface'),
        React.createElement('li', { 
          key: 'f2',
          'data-v0-id': 'list-item-2',
          style: { color: '#555555', fontSize: '14px', marginBottom: '4px' }
        }, 'Real-time preview updates'),
        React.createElement('li', { 
          key: 'f3',
          'data-v0-id': 'list-item-3',
          style: { color: '#555555', fontSize: '14px' }
        }, 'Auto-save functionality')
      ])
    ])
  ])
}`

export default function Home() {
  const [componentCode, setComponentCode] = useState(EXAMPLE_COMPONENT)
  const [isEditing, setIsEditing] = useState(false)
  const [componentId, setComponentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateComponent = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/component", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: componentCode }),
      })

      if (response.ok) {
        const { id } = await response.json()
        setComponentId(id)
        setIsEditing(true)
      }
    } catch (error) {
      console.error("Failed to create component:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (serializedComponent: string) => {
    if (!componentId) return

    try {
      await fetch(`/api/component/${componentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: serializedComponent }),
      })

      setComponentCode(serializedComponent)
    } catch (error) {
      console.error("Failed to save component:", error)
    }
  }

  if (isEditing && componentId) {
    return (
      <ComponentEditor
        initialCode={componentCode}
        componentId={componentId}
        onSave={handleSave}
        onBack={() => setIsEditing(false)}
        onCodeChange={setComponentCode}
      />
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#262624' }}>
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">React Component Editor</h1>
            <p className="text-white/80 text-lg">Paste, edit, and preview React components visually</p>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="editor" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-white/10 border-0 shadow-sm">
                <TabsTrigger
                  value="editor"
                  className="text-white data-[state=active]:bg-[#C96442] data-[state=active]:text-white border-0"
                >
                  <Code2 className="h-4 w-4 mr-2" />
                  Editor
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="text-white data-[state=active]:bg-[#C96442] data-[state=active]:text-white border-0"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="editor">
              <Card className="bg-white/5 border-white/10 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Component Code</CardTitle>
                  <CardDescription className="text-white/70">
                    Enter your React component using React.createElement syntax with inline styles and 'data-v0-id' attributes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Textarea
                    value={componentCode}
                    onChange={(e) => setComponentCode(e.target.value)}
                    placeholder="Paste your React component here..."
                    className="min-h-[400px] font-mono text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#C96442] focus:ring-0"
                  />

                  <Button
                    onClick={handleCreateComponent}
                    disabled={isLoading}
                    className="w-full h-12 text-lg font-medium text-white border-0 shadow-sm"
                    style={{ backgroundColor: '#C96442' }}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </div>
                    ) : (
                      'Start Visual Editing'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <Card className="bg-white/5 border-white/10 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Component Preview</CardTitle>
                  <CardDescription className="text-white/70">
                    Live preview of your component
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg p-8 min-h-[400px] shadow-sm">
                    <ComponentPreview code={componentCode} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function ComponentPreview({ code }: { code: string }) {
  try {
    const componentFunction = new Function("React", `
      const { useState, useEffect, createElement } = React;
      ${code}
      return ExampleComponent;
    `)

    const Component = componentFunction(React)
    return <Component />
  } catch (error) {
    return (
      <div className="text-red-600 p-6 border border-red-200 rounded-lg bg-red-50">
        <p className="font-semibold mb-2">Error rendering component</p>
        <p className="text-sm font-mono bg-red-100 p-2 rounded">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <p className="text-sm mt-2">
          Make sure to use React.createElement syntax and define a function named 'ExampleComponent'.
          Also, ensure elements you want to edit have a unique 'data-v0-id' attribute.
        </p>
      </div>
    )
  }
}