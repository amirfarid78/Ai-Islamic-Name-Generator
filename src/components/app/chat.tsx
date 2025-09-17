"use client";

import { useState, useRef } from 'react';
import { ArrowLeft, LoaderCircle, Send, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { getChatResponse } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import type { NameSuggestion } from '@/app/types';

type Gender = "male" | "female";

export function Chat({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<"initial" | "chatting">("initial");
  const [fatherName, setFatherName] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [suggestions, setSuggestions] = useState<NameSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fatherName || !gender) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide the father's name and select a gender.",
      });
      return;
    }
    setStep("chatting");
    fetchSuggestions();
  };

  const fetchSuggestions = async () => {
    if (!fatherName || !gender) return;
    setIsLoading(true);
    try {
      const existingNames = suggestions.map(s => s.name);
      const newSuggestions = await getChatResponse(fatherName, gender, existingNames);
      if(newSuggestions.length > 0) {
        setSuggestions(prev => [...prev, ...newSuggestions]);
      } else {
        toast({
            title: "No new names",
            description: "The agent couldn't find more names at the moment. Try asking again later!",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not get suggestions from the agent.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "initial") {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft />
             </Button>
            <div className="flex-grow">
                <CardTitle className="font-headline">Chat with an Agent</CardTitle>
                <CardDescription>Get personalized name suggestions.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={startChat} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fatherName">Father's Name</Label>
              <Input
                id="fatherName"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="e.g. Abdullah"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Baby's Gender</Label>
               <RadioGroup
                onValueChange={(value: Gender) => setGender(value)}
                defaultValue={gender || undefined}
                className="flex gap-8 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="text-base">Boy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="text-base">Girl</Label>
                </div>
              </RadioGroup>
            </div>
            <Button type="submit" className="w-full" disabled={!fatherName || !gender}>
              Start Chat
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
     <Card className="w-full max-w-2xl mx-auto h-[70vh] flex flex-col">
        <CardHeader>
            <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft />
             </Button>
            <div className="flex-grow">
                <CardTitle className="font-headline">Suggestions for {gender === 'male' ? 'a boy' : 'a girl'}</CardTitle>
                <CardDescription>Based on the name: {fatherName}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
            <ScrollArea className="flex-grow pr-4 -mr-4">
                <div className="space-y-4">
                     <div className="flex items-start gap-3">
                        <div className="bg-primary text-primary-foreground rounded-full p-2">
                            <Sparkles />
                        </div>
                        <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                            <p className="font-bold">Agent</p>
                            <p>Peace be upon you! I see you're looking for a name for your baby {gender} and the father's name is {fatherName}. Here are a few suggestions I have for you.</p>
                        </div>
                    </div>

                    {suggestions.map((s, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="bg-primary text-primary-foreground rounded-full p-2">
                                <Sparkles />
                            </div>
                            <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                                <p className="font-bold">{s.name}</p>
                                <p className="text-sm text-foreground/80">{s.meaning}</p>
                                <p className="text-xs text-accent-foreground font-semibold">{s.origin}</p>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex items-start gap-3">
                             <div className="bg-primary text-primary-foreground rounded-full p-2">
                                <Sparkles />
                            </div>
                            <div className="bg-muted p-3 rounded-lg max-w-[80%] flex items-center gap-2">
                               <LoaderCircle className="animate-spin h-4 w-4"/>
                               <span>Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
             <div className="mt-auto pt-4 border-t">
                <Button onClick={fetchSuggestions} disabled={isLoading} className="w-full">
                    {isLoading ? <LoaderCircle className="animate-spin"/> : 'Give me more suggestions'}
                </Button>
             </div>
        </CardContent>
    </Card>
  )
}
