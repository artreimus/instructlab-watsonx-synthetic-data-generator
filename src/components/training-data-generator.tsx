'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DownloadIcon, TrashIcon } from 'lucide-react';

type YAMLFile = {
  id: string;
  name: string;
  content: string;
};

export default function TrainingDataGenerator() {
  const [skillDescription, setSkillDescription] = useState('');
  const [yamlFiles, setYamlFiles] = useState<YAMLFile[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulating API call
    const newYamlContent = `
created_by: AI Generator
version: 1
task_description: ${skillDescription}
seed_examples:
  - question: "What is the main concept of ${skillDescription}?"
    answer: "The main concept involves..."
    context: "In the field of ${skillDescription}, experts often..."
  - question: "How is ${skillDescription} applied in real-world scenarios?"
    answer: "Real-world applications include..."
    context: "Practitioners of ${skillDescription} frequently encounter..."
    `;
    const newFile: YAMLFile = {
      id: Date.now().toString(),
      name: `Training Data ${yamlFiles.length + 1}`,
      content: newYamlContent.trim(),
    };
    setYamlFiles((prev) => [...prev, newFile]);
    setActiveTab(newFile.id);
    setIsGenerating(false);
    setSkillDescription('');
  };

  const handleDownload = (file: YAMLFile) => {
    const blob = new Blob([file.content], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name}.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = (id: string) => {
    setYamlFiles((prev) => prev.filter((file) => file.id !== id));
    if (activeTab === id) {
      setActiveTab(yamlFiles[0]?.id || null);
    }
  };

  const handleDownloadAll = () => {
    yamlFiles.forEach((file) => handleDownload(file));
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">
          InstructLab Synthetic Data Generator
        </h1>
        <span className="text-sm text-gray-500">
          powered by <span className="font-semibold">watsonx.ai</span>
        </span>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Skill/Knowledge Description</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGenerate();
              }}
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="skillDescription">
                    Describe the skill or knowledge area:
                  </Label>
                  <Textarea
                    id="skillDescription"
                    value={skillDescription}
                    onChange={(e) => setSkillDescription(e.target.value)}
                    placeholder="Enter a detailed description of the skill or knowledge area..."
                    className="mt-1"
                    rows={5}
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !skillDescription.trim()}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate Training Data'}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated YAML Files</CardTitle>
          </CardHeader>
          <CardContent>
            {yamlFiles.length > 0 ? (
              <Tabs value={activeTab || undefined} onValueChange={setActiveTab}>
                <div className="flex justify-between items-center mb-4">
                  <div className="overflow-x-auto whitespace-nowrap">
                    <TabsList className="flex">
                      {yamlFiles.map((file) => (
                        <TabsTrigger key={file.id} value={file.id}>
                          {file.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDownloadAll}
                    disabled={yamlFiles.length === 0}
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </div>
                {yamlFiles.map(
                  (file) =>
                    activeTab === file.id && ( // Only render the content of the active tab
                      <TabsContent key={file.id} value={file.id}>
                        <Textarea
                          value={file.content}
                          readOnly
                          className="h-[200px] font-mono text-sm mb-2"
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(file)}
                          >
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(file.id)}
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </TabsContent>
                    )
                )}
              </Tabs>
            ) : (
              <div className="text-center text-gray-500">
                No YAML files generated yet. Use the form on the left to
                generate training data.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
