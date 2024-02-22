import { ChangeEvent, FormEvent, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { toast } from 'sonner'

interface NewNoteCardProps {
    onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null // sobrescrevendo o valor da variável
export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
    const [shouldShowOnboarding, setShouldOnboarding] = useState(true)
    const [isRecording, setIsRecording] = useState(false)
    const [content, setContent] = useState("")

    function handleStartEditor() {
        setShouldOnboarding(false)
    }

    function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
        setContent(event.target.value)

        if (event.target.value === "") {
            setShouldOnboarding(true)
        }
    }

    function handleSaveNote(event: FormEvent) {
        event.preventDefault()

        if (content === "") {
            toast.warning("Grave um áudio ou utilize o texto para salvar esta nota!")
        } else {
            onNoteCreated(content)

            setContent("")
            setShouldOnboarding(true)

            toast.success("Nota criada com sucesso!")
        }
    }

    function handleStartRecording() {
        const isSpeechrecognitionAPIAvailable = 'SpeechRecognition' in window
            || 'webkitSpeechRecognition' in window

        if (!isSpeechrecognitionAPIAvailable) {
            alert("Infelizmente seu navegador não suporta a API de gravação!")
            return
        }

        setIsRecording(true)
        setShouldOnboarding(false)

        const speechrecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

        speechRecognition = new speechrecognitionAPI()

        speechRecognition.lang = 'pt-BR'
        speechRecognition.continuous = true // irá gravar até eu pedir de parar de gravar
        speechRecognition.maxAlternatives = 1 // trazer somente uma alternativa de palavras difíceis, a que tem mais chance de ser
        speechRecognition.interimResults = true // trazer os resultados conforme eu vou falando e não só quando eu parar de falar

        speechRecognition.onresult = (event) => { // essa função será chamada toda vez que a API de reconhecimento de fala ouvir algo
            const transcription = Array.from(event.results).reduce((text, result) => {
                return text.concat(result[0].transcript)
            }, "")

            setContent(transcription)
        }

        speechRecognition.onerror = (event) => {
            console.error(event)
        }

        speechRecognition.start()
    }

    function handleStopRecording() {
        setIsRecording(false)

        if (speechRecognition !== null) {
            speechRecognition.stop()
        }
    }

    return (
        <Dialog.Root>
            <Dialog.Trigger className="rounded-md flex flex-col bg-slate-700 text-left p-5 gap-3 outline-none hover:ring-2 hover:ring-slate-600 focus:ring-2 focus:ring-lime-400">
                <span className="text-sm font-medium text-slate-200">
                    Adicionar nota
                </span>

                <p className="text-sm leading-6 text-slate-400">
                    Grave uma nota em áudio que será convertida para texto automaticamente.
                </p>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="inset-0 fixed bg-black/50" />
                <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none">
                    <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
                        <X className="size-5" />
                    </Dialog.Close>

                    <form
                        className="flex-1 flex flex-col"
                    >
                        <div className="flex flex-1 flex-col gap-3 p-5">
                            <span className="text-sm font-medium text-slate-300">
                                Adicionar nota
                            </span>

                            {shouldShowOnboarding ? (
                                <p className="text-sm leading-6 text-slate-400">
                                    Comece <button
                                        type="button"
                                        className="font-medium text-lime-400 hover:underline"
                                        onClick={handleStartRecording}
                                    >
                                        gravando uma nota
                                    </button> em áudio ou se preferir <button
                                        type="button"
                                        className="font-medium text-lime-400 hover:underline"
                                        onClick={handleStartEditor}
                                    >
                                        utilize apenas texto
                                    </button>.
                                </p>
                            ) : (
                                <textarea
                                    autoFocus
                                    className="text-sm leading-6 texte-slate-400 bg-transparent resize-none flex-1 outline-none"
                                    onChange={handleContentChanged}
                                    value={content}
                                />
                            )}
                        </div>

                        {isRecording ? (
                            <button
                                type="button"
                                onClick={handleStopRecording}
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100"
                            >
                                <div className="size-3 rounded-full bg-red-500 animate-pulse" />

                                Gravando! (clique p/ interromper)
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSaveNote}
                                className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500"
                            >
                                Salvar nota
                            </button>
                        )}
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
