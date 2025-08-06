"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Save, RefreshCw, Check } from 'lucide-react'

interface ComponentEditorProps {
  initialCode: string
  componentId: string
  onSave: (code: string) => void
  onBack: () => void
  onCodeChange?: (code: string) => void // NEW: live code update callback
}

interface EditableElement {
  id: string
  element: HTMLElement
  originalValue: string
  dataV0Id: string
}

interface ElementProperties {
  text: string
  color: string
  backgroundColor: string
  fontSize: number
  fontWeight: string
}

export function ComponentEditor({ initialCode, componentId, onSave, onBack, onCodeChange }: ComponentEditorProps) {
  const [selectedElement, setSelectedElement] = useState<EditableElement | null>(null)
  const [componentCode, setComponentCode] = useState(initialCode)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [properties, setProperties] = useState<ElementProperties>({
    text: '',
    color: '#000000',
    backgroundColor: '#ffffff',
    fontSize: 16,
    fontWeight: 'normal'
  })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [renderKey, setRenderKey] = useState(0)
  const previewRef = useRef<HTMLDivElement>(null)

  console.log('🔄 ComponentEditor render:', {
    renderKey,
    hasUnsavedChanges,
    selectedElementId: selectedElement?.dataV0Id,
    codeLength: componentCode.length
  })

  // Auto-save functionality
  useEffect(() => {
    console.log('⏱️ Auto-save timer started, code changed:', componentCode !== initialCode)
    const autoSave = setTimeout(async () => {
      if (componentCode !== initialCode) {
        console.log('💾 Auto-saving component...')
        setIsAutoSaving(true)
        await onSave(componentCode)
        setIsAutoSaving(false)
        console.log('✅ Auto-save completed')
      }
    }, 2000)

    return () => {
      console.log('🚫 Auto-save timer cleared')
      clearTimeout(autoSave)
    }
  }, [componentCode, initialCode, onSave])

  // Update property values and mark as having unsaved changes
  const updateProperty = useCallback((key: keyof ElementProperties, value: any) => {
    console.log('📝 Property updated:', key, value)
    setProperties(prev => {
      const newProps = { ...prev, [key]: value }
      console.log('📋 New properties state:', newProps)
      return newProps
    })
    setHasUnsavedChanges(true)
  }, [])

  // Apply changes to the actual component code
  const applyChangesToCode = useCallback(() => {
    console.log('🔧 applyChangesToCode called:', {
      hasSelectedElement: !!selectedElement,
      hasUnsavedChanges,
      selectedElementDataV0Id: selectedElement?.dataV0Id,
      properties
    })

    if (!selectedElement || !hasUnsavedChanges) {
      console.log('❌ Aborting: No selected element or no unsaved changes')
      return
    }

    const { dataV0Id } = selectedElement
    console.log('🎯 Updating element with data-v0-id:', dataV0Id)
    console.log('📄 Original code length:', componentCode.length)

    const updatedCode = updateElementInCode(componentCode, dataV0Id, properties)

    console.log('📄 Updated code length:', updatedCode.length)
    console.log('🔍 Code changed:', componentCode !== updatedCode)

    if (componentCode !== updatedCode) {
      console.log('✨ Setting new component code and forcing re-render')
      setComponentCode(updatedCode)
      setHasUnsavedChanges(false)
      const newRenderKey = Date.now()
      console.log('🔑 New render key:', newRenderKey)
      setRenderKey(newRenderKey)
      // NEW: Notify parent of code change for live preview
      if (onCodeChange) {
        onCodeChange(updatedCode)
      }
    } else {
      console.log('⚠️ No changes detected in code')
    }
  }, [selectedElement, hasUnsavedChanges, componentCode, properties])

  const handleElementClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    const target = event.target as HTMLElement
    if (!target || target === previewRef.current) {
      console.log('❌ Invalid click target')
      return
    }

    console.log('👆 Element clicked:', {
      tagName: target.tagName,
      className: target.className,
      textContent: target.textContent?.substring(0, 50)
    })

    // Remove previous highlights
    document.querySelectorAll('[data-editor-highlight]').forEach(el => {
      const element = el as HTMLElement
      element.style.outline = ""
      element.style.outlineOffset = ""
      element.removeAttribute('data-editor-highlight')
    })

    const dataV0Id = target.getAttribute('data-v0-id');
    console.log('🆔 Element data-v0-id:', dataV0Id)

    if (!dataV0Id) {
      console.warn("⚠️ Clicked element does not have a 'data-v0-id' attribute. Cannot edit.");
      return;
    }

    const editableElement: EditableElement = {
      id: Math.random().toString(36).substr(2, 9),
      element: target,
      originalValue: target.textContent || "",
      dataV0Id: dataV0Id
    }

    console.log('🎯 Selected element:', editableElement)
    setSelectedElement(editableElement)
    setHasUnsavedChanges(false)

    // Get current styles from computed styles
    const computedStyle = window.getComputedStyle(target)
    console.log('🎨 Computed styles:', {
      color: computedStyle.color,
      backgroundColor: computedStyle.backgroundColor,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight
    })

    const newProperties = {
      text: target.textContent || '',
      color: rgbToHex(computedStyle.color),
      backgroundColor: computedStyle.backgroundColor === 'rgba(0, 0, 0, 0)' ? '#ffffff' : rgbToHex(computedStyle.backgroundColor),
      fontSize: parseInt(computedStyle.fontSize) || 16,
      fontWeight: computedStyle.fontWeight
    }

    console.log('📋 Setting new properties:', newProperties)
    setProperties(newProperties)

    // Highlight selected element
    target.style.outline = "2px solid #C96442"
    target.style.outlineOffset = "2px"
    target.setAttribute('data-editor-highlight', 'true')
    console.log('✨ Element highlighted')
  }

  const handleDeselectElement = () => {
    console.log('🔄 Deselecting element')
    // Remove highlight from selected element
    if (selectedElement) {
      const elements = document.querySelectorAll(`[data-v0-id="${selectedElement.dataV0Id}"]`)
      console.log('🎯 Found elements to unhighlight:', elements.length)
      elements.forEach(el => {
        const element = el as HTMLElement
        element.style.outline = ""
        element.style.outlineOffset = ""
        element.removeAttribute('data-editor-highlight')
      })
    }
    setSelectedElement(null)
    setHasUnsavedChanges(false)
  }

  const renderComponent = () => {
    console.log('🎭 Rendering component with key:', renderKey)
    try {
      const componentFunction = new Function("React", `
        console.log('🏗️ Component function executing with React:', !!React);
        const { useState, useEffect, createElement } = React;
        ${componentCode}
        console.log('✅ Component function created successfully');
        return ExampleComponent;
      `)

      const Component = componentFunction(React)
      console.log('🎯 Component created:', typeof Component)
      return <Component key={renderKey} />
    } catch (error) {
      console.error('❌ Error rendering component:', error)
      return (
        <div className="text-red-600 p-6 border border-red-200 rounded-lg bg-red-50">
          <p className="font-semibold mb-2">Error rendering component</p>
          <p className="text-sm font-mono bg-red-100 p-2 rounded">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <p className="text-sm mt-2">
            Please check your component syntax and ensure elements have 'data-v0-id' attributes.
          </p>
        </div>
      )
    }
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#262624' }}>
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/10 border-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-white">Component Editor</h1>
              <p className="text-sm text-white/60">ID: {componentId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAutoSaving && (
              <span className="text-sm text-white/60">Auto-saving...</span>
            )}
            <Button
              onClick={() => onSave(componentCode)}
              className="text-white border-0"
              style={{ backgroundColor: '#C96442' }}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-lg min-h-full shadow-sm">
            <div ref={previewRef} className="p-8 cursor-pointer min-h-[500px]" onClick={handleElementClick}>
              {renderComponent()}
            </div>
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-80 bg-white/5 border-l border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white mb-2">Element Properties</h2>
          <p className="text-sm text-white/70">
            {selectedElement ? "Modify properties and click Update" : "Click on an element to edit it"}
          </p>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-auto">
          {selectedElement ? (
            <Card className="bg-white/5 border-white/10 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-sm flex items-center justify-between">
                  <span>Element: {selectedElement.element.tagName.toLowerCase()}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeselectElement}
                    className="text-white/60 hover:text-white hover:bg-white/10 h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Text Content */}
                <div>
                  <Label className="text-white text-sm mb-2 block">Text Content</Label>
                  <Input
                    value={properties.text}
                    onChange={(e) => updateProperty('text', e.target.value)}
                    placeholder="Enter text content"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#C96442] focus:ring-0"
                  />
                </div>

                {/* Text Color */}
                <div>
                  <Label className="text-white text-sm mb-2 block">Text Color</Label>
                  <Input
                    type="color"
                    value={properties.color}
                    onChange={(e) => updateProperty('color', e.target.value)}
                    className="h-12 bg-white/10 border-white/20 focus:border-[#C96442] focus:ring-0"
                  />
                </div>

                {/* Background Color */}
                <div>
                  <Label className="text-white text-sm mb-2 block">Background Color</Label>
                  <Input
                    type="color"
                    value={properties.backgroundColor}
                    onChange={(e) => updateProperty('backgroundColor', e.target.value)}
                    className="h-12 bg-white/10 border-white/20 focus:border-[#C96442] focus:ring-0"
                  />
                </div>

                {/* Font Size */}
                <div>
                  <Label className="text-white text-sm mb-3 block">
                    Font Size: {properties.fontSize}px
                  </Label>
                  <Slider
                    min={8}
                    max={48}
                    step={1}
                    value={[properties.fontSize]}
                    onValueChange={(value) => updateProperty('fontSize', value[0])}
                    className="mt-2"
                  />
                </div>

                {/* Font Weight */}
                <div>
                  <Label className="text-white text-sm mb-2 block">Font Weight</Label>
                  <Select
                    value={properties.fontWeight}
                    onValueChange={(value) => updateProperty('fontWeight', value)}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-[#C96442] focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262624] border-white/20">
                      <SelectItem value="normal" className="text-white focus:bg-[#C96442] focus:text-white">Normal</SelectItem>
                      <SelectItem value="bold" className="text-white focus:bg-[#C96442] focus:text-white">Bold</SelectItem>
                      <SelectItem value="lighter" className="text-white focus:bg-[#C96442] focus:text-white">Lighter</SelectItem>
                      <SelectItem value="bolder" className="text-white focus:bg-[#C96442] focus:text-white">Bolder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Update Button */}
                <Button
                  onClick={applyChangesToCode}
                  disabled={!hasUnsavedChanges}
                  className="w-full text-white border-0"
                  style={{
                    backgroundColor: hasUnsavedChanges ? '#C96442' : '#555555',
                    cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed'
                  }}
                >
                  {hasUnsavedChanges ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Update Element
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      No Changes
                    </>
                  )}
                </Button>

                {/* Status indicator */}
                <div className={`border rounded-lg p-3 ${hasUnsavedChanges ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
                  <p className={`text-xs ${hasUnsavedChanges ? 'text-yellow-400' : 'text-green-400'}`}>
                    {hasUnsavedChanges ? (
                      '⚠️ You have unsaved changes. Click Update to apply them.'
                    ) : (
                      '✅ All changes are applied to the component'
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/70 font-medium">Select an element to start editing</p>
              <p className="text-sm text-white/50 mt-1">Click on any element in the preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to update a specific element in the code
function updateElementInCode(code: string, targetDataV0Id: string, properties: ElementProperties): string {
  // Robustly update the style and text of a React.createElement with the given data-v0-id
  const lines = code.split('\n');
  let startIdx = -1, endIdx = -1;
  let found = false;
  let braceDepth = 0;

  // Find the React.createElement block for the target data-v0-id
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('React.createElement')) {
      // Look for the opening brace of the props object
      for (let j = i + 1; j < lines.length; j++) {
        const patterns = [
          `'data-v0-id': '${targetDataV0Id}'`,
          `"data-v0-id": "${targetDataV0Id}"`,
          `'data-v0-id': "${targetDataV0Id}"`,
          `"data-v0-id": '${targetDataV0Id}'`,
          `data-v0-id: '${targetDataV0Id}'`,
          `data-v0-id: "${targetDataV0Id}"`
        ];
        if (patterns.some(pattern => lines[j].includes(pattern))) {
          startIdx = i;
          found = true;
          break;
        }
        // Stop if another createElement is found first
        if (lines[j].includes('React.createElement')) break;
      }
    }
    if (found) break;
  }
  if (!found) return code;

  // Find the end of the React.createElement call (matching parentheses)
  for (let i = startIdx; i < lines.length; i++) {
    if (lines[i].includes('React.createElement')) braceDepth = 0;
    for (let c of lines[i]) {
      if (c === '(') braceDepth++;
      else if (c === ')') braceDepth--;
    }
    if (braceDepth === 0) {
      endIdx = i;
      break;
    }
  }
  if (endIdx === -1) return code;

  // Extract the block
  const block = lines.slice(startIdx, endIdx + 1);
  console.log('🟦 Extracted React.createElement block:', block.join('\n'));

  // Update style and text in the block
  let newBlock = [...block];
  let styleLineIdx = -1;
  let textLineIdx = -1;
  let inProps = false, propsStart = -1, propsEnd = -1, braces = 0;

  // Find props object and text argument
  for (let i = 0; i < newBlock.length; i++) {
    const line = newBlock[i];
    if (line.includes('{') && propsStart === -1) {
      propsStart = i;
      braces = 1;
      inProps = true;
      continue;
    }
    if (inProps) {
      if (line.includes('{')) braces++;
      if (line.includes('}')) braces--;
      if (braces === 0) {
        propsEnd = i;
        inProps = false;
      }
      if (line.trim().startsWith('style:')) styleLineIdx = i;
      if (line.includes(`data-v0-id`) && line.includes(targetDataV0Id)) {
        // Could be used for more precise targeting
      }
    }
    // Text argument is usually after the props object
    if (!inProps && propsEnd !== -1 && textLineIdx === -1 && line.trim().startsWith("'")) {
      textLineIdx = i;
    }
  }
  // Build style string
  const styleString = `style: { color: '${properties.color}', backgroundColor: '${properties.backgroundColor}', fontSize: '${properties.fontSize}px', fontWeight: '${properties.fontWeight}' }`;
  // Update or insert style
  if (styleLineIdx !== -1) {
    newBlock[styleLineIdx] = newBlock[styleLineIdx].replace(/style:\s*\{[^}]*\}/, styleString);
  } else if (propsEnd !== -1) {
    // Insert before closing brace of props
    newBlock[propsEnd] = newBlock[propsEnd].replace('}', `  ${styleString},\n}`);
  }
  // Update text: robustly handle multi-line and trailing argument
  let textUpdated = false;
  // Try to find a line after propsEnd that matches }, 'text'),
  if (propsEnd !== -1) {
    for (let i = propsEnd; i < newBlock.length; i++) {
      const match = newBlock[i].match(/}\s*,\s*(['"`])(.+?)\1\s*\),?/);
      if (match) {
        const quote = match[1];
        const before = newBlock[i];
        newBlock[i] = newBlock[i].replace(/(}\s*,\s*)(['"`]).+?\2(\s*\),?)/, `$1${quote}${properties.text}${quote}$3`);
        textUpdated = true;
        console.log('🟦 Trailing text argument updated:', before, '→', newBlock[i]);
        break;
      }
    }
  }
  // Fallback to old logic if not found
  if (!textUpdated) {
    if (textLineIdx !== -1) {
      // Multi-line: update the line after props
      console.log('🟨 textLineIdx found:', textLineIdx, 'Line:', newBlock[textLineIdx]);
      const indent = newBlock[textLineIdx].match(/^\s*/)?.[0] || '';
      newBlock[textLineIdx] = `${indent}'${properties.text}'`;
      console.log('🟩 Updated text line:', newBlock[textLineIdx]);
    } else {
      // Inline: fallback to regex
      let blockJoined = newBlock.join('\n');
      console.log('🟧 Fallback to regex for inline text update');
      const before = blockJoined;
      blockJoined = blockJoined.replace(
        /(React\.createElement\s*\([^,]+,\s*\{[^}]*\},\s*)(['"`])[^'"`]*\2/s,
        `$1'${properties.text}'`
      );
      if (blockJoined !== before) {
        console.log('🟩 Regex text update succeeded');
      } else {
        console.log('🟥 Regex text update did NOT match');
      }
      newBlock = blockJoined.split('\n');
    }
  }
  // Replace in original lines
  const updatedLines = [
    ...lines.slice(0, startIdx),
    ...newBlock,
    ...lines.slice(endIdx + 1)
  ];
  return updatedLines.join('\n');

function rgbToHex(rgb: string): string {
  console.log('🎨 Converting RGB to hex:', rgb)

  if (rgb.startsWith('#')) {
    console.log('🎨 Already hex format')
    return rgb
  }

  const result = rgb.match(/\d+/g)
  if (!result) {
    console.log('🎨 No RGB values found, returning default')
    return '#000000'
  }

  const [r, g, b] = result.map(Number)
  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  console.log('🎨 Converted to hex:', hex)
  return hex
}