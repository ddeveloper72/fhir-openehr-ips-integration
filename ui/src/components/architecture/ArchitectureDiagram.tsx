import React, { useEffect, useState } from 'react';

export type FlowType = 'query' | 'store' | 'summary' | 'idle';

interface ArchitectureDiagramProps {
  flow: FlowType;
  title?: string;
  description?: string;
  autoAnimate?: boolean;
}

export function ArchitectureDiagram({ 
  flow, 
  title, 
  description,
  autoAnimate = false 
}: ArchitectureDiagramProps) {
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Debug: Component mounted
  useEffect(() => {
    console.log('[ArchitectureDiagram] Component mounted with flow:', flow);
    setMounted(true);
  }, [flow]);

  // Auto-start animation with a small delay so users can see it begin
  useEffect(() => {
    if (autoAnimate && flow !== 'idle') {
      const timer = setTimeout(() => {
        console.log('[ArchitectureDiagram] Starting animation for flow:', flow);
        setIsAnimating(true);
      }, 500); // 500ms delay before starting
      return () => clearTimeout(timer);
    }
  }, [autoAnimate, flow]);

  useEffect(() => {
    if (!isAnimating || flow === 'idle') return;

    const maxSteps = flow === 'query' ? 4 : flow === 'store' ? 5 : 4;
    // Increased to 3000ms (3 seconds per step) for clear visibility
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % (maxSteps + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [isAnimating, flow]);

  const getFlowTitle = () => {
    switch (flow) {
      case 'query': return 'Querying FHIR Resources';
      case 'store': return 'Storing FHIR Bundle';
      case 'summary': return 'Fetching Patient Summary';
      default: return 'System Architecture';
    }
  };

  const getFlowDescription = () => {
    switch (flow) {
      case 'query': return 'GET /Patient → AQL Query → openEHR CDR → FHIR Response';
      case 'store': return 'POST Bundle → openFHIR Mapping → openEHR Composition';
      case 'summary': return 'GET /Patient/$summary → AQL Query → IPS Bundle';
      default: return 'FHIR facade on openEHR Clinical Data Repository';
    }
  };

  const isActive = (component: string, step: number) => {
    if (flow === 'idle') return false;
    
    if (flow === 'query') {
      // GET flow: Browser → Firely → openFHIR → CDR → back
      const steps: Record<number, string[]> = {
        1: ['browser'],
        2: ['browser', 'firely', 'arrow1'],
        3: ['firely', 'openfhir', 'arrow2'],
        4: ['openfhir', 'cdr', 'arrow3'],
      };
      return steps[step]?.includes(component);
    }
    
    if (flow === 'store') {
      // POST flow: Browser → Firely → openFHIR → CDR
      const steps: Record<number, string[]> = {
        1: ['browser'],
        2: ['browser', 'firely', 'arrow1'],
        3: ['firely', 'openfhir', 'arrow2'],
        4: ['openfhir', 'arrow3'],
        5: ['openfhir', 'cdr', 'arrow3'],
      };
      return steps[step]?.includes(component);
    }
    
    if (flow === 'summary') {
      // $summary flow: Browser → Firely → openFHIR → CDR → back
      const steps: Record<number, string[]> = {
        1: ['browser'],
        2: ['browser', 'firely', 'arrow1'],
        3: ['firely', 'openfhir', 'arrow2'],
        4: ['openfhir', 'cdr', 'arrow3'],
      };
      return steps[step]?.includes(component);
    }
    
    return false;
  };

  const isPulsing = (component: string) => {
    return isActive(component, animationStep);
  };

  const getCurrentStepDescription = () => {
    if (flow === 'idle' || animationStep === 0) return null;
    
    if (flow === 'query') {
      const steps = [
        '',
        '1️⃣ Browser sends FHIR query request',
        '2️⃣ Firely Server translating FHIR → AQL',
        '3️⃣ Querying openEHR CDR with AQL',
        '4️⃣ Converting openEHR data → FHIR response'
      ];
      return steps[animationStep];
    }
    
    if (flow === 'store') {
      const steps = [
        '',
        '1️⃣ Browser submits IPS Bundle',
        '2️⃣ Firely Server parsing FHIR Bundle',
        '3️⃣ openFHIR applying FHIRConnect mappings',
        '4️⃣ Creating openEHR Composition',
        '5️⃣ Storing data in CDR'
      ];
      return steps[animationStep];
    }
    
    if (flow === 'summary') {
      const steps = [
        '',
        '1️⃣ Browser requests patient summary',
        '2️⃣ Firely Server generating AQL queries',
        '3️⃣ Retrieving data from openEHR CDR',
        '4️⃣ Assembling complete IPS Bundle'
      ];
      return steps[animationStep];
    }
    
    return null;
  };

  // Show loading state while hydrating
  if (!mounted) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="text-center py-4">
          <div className="animate-pulse text-slate-600">Loading architecture diagram...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          {title || getFlowTitle()}
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          {description || getFlowDescription()}
        </p>
      </div>

      {flow !== 'idle' && (
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              isAnimating
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {isAnimating ? 'Pause Animation' : 'Play Animation'}
          </button>
          {isAnimating && (
            <span className="text-xs text-slate-500">
              Step {animationStep} of {flow === 'store' ? 5 : 4}
            </span>
          )}
        </div>
      )}

      {/* Current Step Indicator */}
      {flow !== 'idle' && isAnimating && animationStep > 0 && (
        <div className="mb-4 p-3 bg-primary-50 border-l-4 border-primary-500 rounded">
          <p className="text-sm font-semibold text-primary-900">
            {getCurrentStepDescription()}
          </p>
        </div>
      )}

      <div className="relative" style={{ minHeight: '280px' }}>
        <svg
          viewBox="0 0 800 280"
          className="w-full h-auto"
          style={{ maxWidth: '800px' }}
        >
          {/* Browser/Client */}
          <g transform="translate(40, 100)">
            <rect
              x="0"
              y="0"
              width="120"
              height="80"
              rx="8"
              className={`transition-all duration-300 ${
                isPulsing('browser')
                  ? 'fill-blue-500 stroke-blue-600'
                  : 'fill-slate-100 stroke-slate-300'
              }`}
              strokeWidth="2"
            />
            <text x="60" y="35" textAnchor="middle" className="fill-slate-700 text-sm font-semibold">
              Browser
            </text>
            <text x="60" y="55" textAnchor="middle" className="fill-slate-600 text-xs">
              FHIR Client
            </text>
            {isPulsing('browser') && (
              <circle cx="60" cy="40" r="30" className="fill-blue-400 opacity-30 animate-ping" />
            )}
          </g>

          {/* Arrow 1: Browser → Firely */}
          <g>
            <defs>
              <marker
                id="arrowhead1"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  className={isPulsing('arrow1') ? 'fill-green-500' : 'fill-slate-400'}
                />
              </marker>
            </defs>
            <line
              x1="160"
              y1="140"
              x2="240"
              y2="140"
              className={`transition-all duration-300 ${
                isPulsing('arrow1') ? 'stroke-green-500' : 'stroke-slate-400'
              }`}
              strokeWidth="2"
              markerEnd="url(#arrowhead1)"
            />
            {isPulsing('arrow1') && (
              <circle cx="200" cy="140" r="4" className="fill-green-500 animate-ping" />
            )}
          </g>

          {/* Firely Server */}
          <g transform="translate(240, 100)">
            <rect
              x="0"
              y="0"
              width="140"
              height="80"
              rx="8"
              className={`transition-all duration-300 ${
                isPulsing('firely')
                  ? 'fill-indigo-500 stroke-indigo-600'
                  : 'fill-slate-100 stroke-slate-300'
              }`}
              strokeWidth="2"
            />
            <text x="70" y="30" textAnchor="middle" className="fill-slate-700 text-sm font-semibold">
              Firely Server
            </text>
            <text x="70" y="48" textAnchor="middle" className="fill-slate-600 text-xs">
              FHIR Facade
            </text>
            <text x="70" y="63" textAnchor="middle" className="fill-slate-600 text-xs">
              + openFHIR Plugin
            </text>
            {isPulsing('firely') && (
              <circle cx="70" cy="40" r="35" className="fill-indigo-400 opacity-30 animate-ping" />
            )}
          </g>

          {/* Arrow 2: Firely → openFHIR */}
          <g>
            <defs>
              <marker
                id="arrowhead2"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  className={isPulsing('arrow2') ? 'fill-purple-500' : 'fill-slate-400'}
                />
              </marker>
            </defs>
            <line
              x1="380"
              y1="140"
              x2="460"
              y2="140"
              className={`transition-all duration-300 ${
                isPulsing('arrow2') ? 'stroke-purple-500' : 'stroke-slate-400'
              }`}
              strokeWidth="2"
              markerEnd="url(#arrowhead2)"
            />
            {isPulsing('arrow2') && (
              <circle cx="420" cy="140" r="4" className="fill-purple-500 animate-ping" />
            )}
          </g>

          {/* openFHIR */}
          <g transform="translate(460, 100)">
            <rect
              x="0"
              y="0"
              width="140"
              height="80"
              rx="8"
              className={`transition-all duration-300 ${
                isPulsing('openfhir')
                  ? 'fill-purple-500 stroke-purple-600'
                  : 'fill-slate-100 stroke-slate-300'
              }`}
              strokeWidth="2"
            />
            <text x="70" y="30" textAnchor="middle" className="fill-slate-700 text-sm font-semibold">
              openFHIR
            </text>
            <text x="70" y="48" textAnchor="middle" className="fill-slate-600 text-xs">
              FHIRConnect
            </text>
            <text x="70" y="63" textAnchor="middle" className="fill-slate-600 text-xs">
              Mapping Engine
            </text>
            {isPulsing('openfhir') && (
              <circle cx="70" cy="40" r="35" className="fill-purple-400 opacity-30 animate-ping" />
            )}
          </g>

          {/* Arrow 3: openFHIR → CDR */}
          <g>
            <defs>
              <marker
                id="arrowhead3"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  className={isPulsing('arrow3') ? 'fill-orange-500' : 'fill-slate-400'}
                />
              </marker>
            </defs>
            <line
              x1="600"
              y1="140"
              x2="660"
              y2="140"
              className={`transition-all duration-300 ${
                isPulsing('arrow3') ? 'stroke-orange-500' : 'stroke-slate-400'
              }`}
              strokeWidth="2"
              markerEnd="url(#arrowhead3)"
            />
            {isPulsing('arrow3') && (
              <circle cx="630" cy="140" r="4" className="fill-orange-500 animate-ping" />
            )}
          </g>

          {/* openEHR CDR */}
          <g transform="translate(660, 100)">
            <rect
              x="0"
              y="0"
              width="120"
              height="80"
              rx="8"
              className={`transition-all duration-300 ${
                isPulsing('cdr')
                  ? 'fill-orange-500 stroke-orange-600'
                  : 'fill-slate-100 stroke-slate-300'
              }`}
              strokeWidth="2"
            />
            <text x="60" y="30" textAnchor="middle" className="fill-slate-700 text-sm font-semibold">
              openEHR
            </text>
            <text x="60" y="48" textAnchor="middle" className="fill-slate-600 text-xs">
              CDR
            </text>
            <text x="60" y="63" textAnchor="middle" className="fill-slate-600 text-xs">
              (EHRBase)
            </text>
            {isPulsing('cdr') && (
              <circle cx="60" cy="40" r="30" className="fill-orange-400 opacity-30 animate-ping" />
            )}
          </g>

          {/* Labels */}
          <text x="200" y="125" textAnchor="middle" className="fill-slate-500 text-xs">
            {flow === 'query' && isPulsing('arrow1') && 'GET /Patient'}
            {flow === 'store' && isPulsing('arrow1') && 'POST Bundle'}
            {flow === 'summary' && isPulsing('arrow1') && 'GET $summary'}
          </text>
          
          <text x="420" y="125" textAnchor="middle" className="fill-slate-500 text-xs">
            {isPulsing('arrow2') && 'FHIRConnect'}
          </text>
          
          <text x="630" y="125" textAnchor="middle" className="fill-slate-500 text-xs">
            {flow === 'query' && isPulsing('arrow3') && 'AQL Query'}
            {flow === 'store' && isPulsing('arrow3') && 'Composition'}
            {flow === 'summary' && isPulsing('arrow3') && 'AQL Query'}
          </text>

          {/* Process labels */}
          <text x="400" y="240" textAnchor="middle" className="fill-slate-600 text-sm font-medium">
            {flow === 'query' && animationStep === 2 && 'Translating FHIR → AQL'}
            {flow === 'query' && animationStep === 3 && 'Querying openEHR CDR'}
            {flow === 'query' && animationStep === 4 && 'Converting openEHR → FHIR'}
            {flow === 'store' && animationStep === 2 && 'Parsing FHIR Bundle'}
            {flow === 'store' && animationStep === 3 && 'Applying FHIRConnect Mappings'}
            {flow === 'store' && animationStep === 4 && 'Creating openEHR Composition'}
            {flow === 'store' && animationStep === 5 && 'Storing in CDR'}
            {flow === 'summary' && animationStep === 2 && 'Generating AQL Queries'}
            {flow === 'summary' && animationStep === 3 && 'Retrieving Patient Data'}
            {flow === 'summary' && animationStep === 4 && 'Building IPS Bundle'}
          </text>
        </svg>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-slate-600">FHIR Client</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-500 rounded"></div>
            <span className="text-slate-600">FHIR Server</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-slate-600">Mapping Engine</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-slate-600">CDR Storage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
