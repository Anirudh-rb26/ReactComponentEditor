"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Eye } from 'lucide-react'

interface Component {
  id: string
  code: string
  createdAt: string
  updatedAt: string
}

export default function PreviewPage() {
  const params = useParams()
  const [component, setComponent] = useState<Component | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchComponent = async () => {
      try {
        const response = await fetch(`/api/component/${params.id}`)

        if (!response.ok) {
          throw new Error("Component not found")
        }

        const data = await response.json()
        setComponent(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load component")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchComponent()
    }
  }, [params.id])

  const renderComponent = () => {
    if (!component) return null

    try {
      const componentFunction = new Function("React", `
        const { useState, useEffect, createElement } = React;
        ${component.code}
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
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#262624' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading component...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#262624' }}>
        <Card className="max-w-md w-full bg-white/5 border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Component Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-white/70">{error}</p>
            <Link href="/">
              <Button className="w-full text-white" style={{ backgroundColor: '#C96442' }}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#262624' }}>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Editor
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Eye className="h-6 w-6" style={{ color: '#C96442' }} />
                  Component Preview
                </h1>
                <p className="text-white/60 text-sm font-mono">{params.id}</p>
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg p-8 min-h-[400px]">
                {renderComponent()}
              </div>
            </CardContent>
          </Card>

          {/* Component Details */}
          {component && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Component Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/70 text-sm">Created</p>
                    <p className="text-white">{new Date(component.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Last Updated</p>
                    <p className="text-white">{new Date(component.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
