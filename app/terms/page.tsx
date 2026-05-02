import React from 'react'

const toc = [
    { href: '#section-prohibited-use', label: 'Prohibited use' },
    { href: '#section-termination', label: 'Termination' },
    { href: '#section-governing-law', label: 'Governing law' },
    { href: '#section-disputes', label: 'Disputes' },
    { href: '#section-force-majeure', label: 'Force majeure' },
    { href: '#section-availability', label: 'Service availability' },
    { href: '#section-indemnification', label: 'Indemnification' },
    { href: '#section-contact', label: 'Contact us' },
]

function Page() {
    return (
        <main className="flex-1">

            {/* Page header */}
            <div className="border-b border-edge bg-surface">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-px w-6 bg-primary" />
                        <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">Legal</span>
                    </div>
                    <h1 className="text-3xl font-black uppercase text-foreground">Terms of Service</h1>
                    <p className="text-sm text-dimmed mt-1">Last updated May 1, 2026</p>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex gap-10">

                    {/* Sticky TOC sidebar */}
                    <aside className="hidden lg:block w-52 shrink-0">
                        <div className="sticky top-24 bg-surface-2 border border-edge rounded-xl p-5">
                            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Contents</p>
                            <nav className="space-y-0.5">
                                {toc.map(item => (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        className="block text-sm text-dimmed hover:text-primary transition-colors py-1 leading-snug"
                                    >
                                        {item.label}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">

                        {/* Intro */}
                        <section className="pb-8 border-b border-edge">
                            <p className="text-sm text-dimmed leading-relaxed mb-4">
                                This terms of service ("Terms", "Agreement") are an agreement between Obscurus ("us",
                                "we", "our" or "Company") and you ("User", "you" or "your"). This Agreement sets forth
                                the general terms and conditions of your use of the{' '}
                                <a href="https://obscurus.us" className="text-primary hover:underline transition-colors">
                                    https://obscurus.us
                                </a>{' '}
                                website and any of its products or services (collectively, "Website" or "Services").
                            </p>
                            <p className="text-sm text-dimmed leading-relaxed">
                                You must be at least 18 years of age to use this website. By using this website and by
                                agreeing to these terms of service, you warrant and represent that you are at least 18
                                years of age.
                            </p>
                        </section>

                        {/* Prohibited use */}
                        <section id="section-prohibited-use" className="py-8 border-b border-edge scroll-mt-20">
                            <h2 className="text-lg font-bold text-foreground mb-4">Prohibited use</h2>
                            <p className="text-sm text-dimmed leading-relaxed">
                                You may not use the service for any purpose outside of the core service proposition. You
                                may not use the service for any commercial activity that is not explicitly endorsed by us.
                            </p>
                        </section>

                        {/* Termination */}
                        <section id="section-termination" className="py-8 border-b border-edge scroll-mt-20">
                            <h2 className="text-lg font-bold text-foreground mb-4">Termination</h2>
                            <p className="text-sm text-dimmed leading-relaxed mb-3">
                                We may terminate or suspend your account and bar access to the service immediately,
                                without prior notice or liability, under our sole discretion, for any reason whatsoever
                                and without limitation, including but not limited to a breach of the terms.
                            </p>
                            <p className="text-sm text-dimmed leading-relaxed mb-3">
                                If you wish to terminate your account, you may simply discontinue using the service. All
                                provisions of the terms which by their nature should survive termination shall survive
                                termination, including, without limitation, ownership provisions, warranty disclaimers,
                                indemnity and limitations of liability.
                            </p>
                            <p className="text-sm text-dimmed leading-relaxed mb-3">
                                If any provision of the terms is found to be unenforceable or invalid, then only that
                                provision shall be modified to reflect the parties&#39; intention or eliminated to the
                                minimum extent necessary so that the terms shall otherwise remain in full force and effect
                                and enforceable.
                            </p>
                            <p className="text-sm text-dimmed leading-relaxed">
                                The failure to enforce any part of the terms shall not be considered a waiver of our
                                right to later enforce that or any other part of the terms. Waiver of compliance in any
                                particular instance does not mean that we will waive compliance in the future.
                            </p>
                        </section>

                        {/* Governing law */}
                        <section id="section-governing-law" className="py-8 border-b border-edge scroll-mt-20">
                            <h2 className="text-lg font-bold text-foreground mb-4">Governing law</h2>
                            <p className="text-sm text-dimmed leading-relaxed">
                                These terms shall be governed and construed in accordance with the laws of California,
                                without regard to its conflict of law provisions.
                            </p>
                        </section>

                        {/* Disputes */}
                        <section id="section-disputes" className="py-8 border-b border-edge scroll-mt-20">
                            <h2 className="text-lg font-bold text-foreground mb-4">Disputes</h2>
                            <p className="text-sm text-dimmed leading-relaxed">
                                Any dispute arising under or relating to this agreement may only be brought in the courts
                                of the jurisdiction of California.
                            </p>
                        </section>

                        {/* Force majeure */}
                        <section id="section-force-majeure" className="py-8 border-b border-edge scroll-mt-20">
                            <h2 className="text-lg font-bold text-foreground mb-4">Force majeure</h2>
                            <p className="text-sm text-dimmed leading-relaxed mb-3">
                                We shall not be liable for any failure or delay in performing our obligations under these
                                terms where such failure or delay results from circumstances beyond our reasonable
                                control.
                            </p>
                            <p className="text-sm text-dimmed leading-relaxed mb-3">
                                Such circumstances include, but are not limited to: natural disasters, acts of God, war,
                                terrorism, riots, embargoes, acts of civil or military authorities, fire, floods,
                                accidents, pandemic, epidemic, strikes, or shortages of transportation, facilities, fuel,
                                energy, labor, or materials.
                            </p>
                            <p className="text-sm text-dimmed leading-relaxed">
                                In the event of a force majeure event, our obligations under these terms will be
                                suspended for the duration of the event, and we will use reasonable efforts to minimize
                                the impact on our services.
                            </p>
                        </section>

                        {/* Service availability */}
                        <section id="section-availability" className="py-8 border-b border-edge scroll-mt-20">
                            <h2 className="text-lg font-bold text-foreground mb-4">Service availability</h2>
                            <p className="text-sm text-dimmed leading-relaxed mb-3">
                                The Service is provided to You &#34;AS IS&#34; and &#34;AS AVAILABLE&#34; and with all
                                faults and defects without warranty of any kind. To the maximum extent permitted under
                                applicable law, the Company, on its own behalf and on behalf of its Affiliates and its
                                and their respective licensors and service providers, expressly disclaims all warranties,
                                whether express, implied, statutory or otherwise, with respect to the Service, including
                                all implied warranties of merchantability, fitness for a particular purpose, title and
                                non-infringement, and warranties that may arise out of course of dealing, course of
                                performance, usage or trade practice.
                            </p>
                            <p className="text-sm text-dimmed leading-relaxed mb-3">
                                The Company reserves the right to modify, suspend or discontinue, temporarily or
                                permanently, the Service or any service to which it connects, with or without notice and
                                without liability to You.
                            </p>
                            <p className="text-sm text-dimmed leading-relaxed">
                                Without limiting the foregoing, neither the Company nor any of the company&#39;s
                                provider makes any representation or warranty of any kind, express or implied: (i) as to
                                the operation or availability of the Service; (ii) that the Service will be
                                uninterrupted or error-free; (iii) as to the accuracy, reliability, or currency of any
                                information or content provided through the Service; or (iv) that the Service, its
                                servers, the content, or e-mails sent from or on behalf of the Company are free of
                                viruses, scripts, trojan horses, worms, malware, timebombs or other harmful components.
                            </p>
                        </section>

                        {/* Indemnification */}
                        <section id="section-indemnification" className="py-8 border-b border-edge scroll-mt-20">
                            <h2 className="text-lg font-bold text-foreground mb-4">Indemnification</h2>
                            <p className="text-sm text-dimmed leading-relaxed">
                                You agree to indemnify and hold us and our employees, contractors, agents and directors
                                harmless from any and all claims, losses, liabilities, demands, expenses, and costs,
                                including legal fees, resulting from your use of the service or your violation of these
                                terms of service.
                            </p>
                        </section>

                        {/* Contact */}
                        <section id="section-contact" className="py-8 scroll-mt-20">
                            <h2 className="text-lg font-bold text-foreground mb-4">Contact us</h2>
                            <p className="text-sm text-dimmed leading-relaxed mb-3">
                                If you have questions or comments about these terms, you can contact us at{' '}
                                <a href="mailto:" className="text-primary hover:underline transition-colors"></a>.
                            </p>
                            <p className="text-sm text-dimmed leading-relaxed">Obscurus</p>
                        </section>

                    </div>
                </div>
            </div>
        </main>
    )
}

export default Page
