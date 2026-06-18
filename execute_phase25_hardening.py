import os

# Phase 2.5 Gesture + Pointer System Hardening Script

def unify_all_remaining_sandboxes():
    # We will normalize all HTML buttons across attentional-blink, memory-churn, tachistoscope, and cyber-mines to use guaranteed pointerdown/pointerup architecture with setPointerCapture
    
    # 1. Attentional Blink
    ab_path = 'games/attentional-blink/index.html'
    if os.path.exists(ab_path):
        with open(ab_path, 'r', encoding='utf-8') as f:
            txt = f.read()
        if "startBtn.addEventListener('pointerdown'" not in txt:
            txt = txt.replace(
                "startBtn.addEventListener('click', () => {",
                "startBtn.style.touchAction='none'; startBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); try{ e.target.setPointerCapture(e.pointerId); }catch(err){}"
            ).replace(
                "submitBtn.addEventListener('click', () => {",
                "submitBtn.style.touchAction='none'; submitBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); try{ e.target.setPointerCapture(e.pointerId); }catch(err){}"
            )
            with open(ab_path, 'w', encoding='utf-8') as f:
                f.write(txt)
            print(f"Hardened Attentional Blink in: {ab_path}")

    # 2. Tachistoscope
    ts_path = 'games/tachistoscope/index.html'
    if os.path.exists(ts_path):
        with open(ts_path, 'r', encoding='utf-8') as f:
            txt = f.read()
        if "flashBtn.addEventListener('pointerdown'" not in txt:
            txt = txt.replace(
                "flashBtn.addEventListener('click', () => {",
                "flashBtn.style.touchAction='none'; flashBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); try{ e.target.setPointerCapture(e.pointerId); }catch(err){}"
            ).replace(
                "verifyBtn.addEventListener('click', () => {",
                "verifyBtn.style.touchAction='none'; verifyBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); try{ e.target.setPointerCapture(e.pointerId); }catch(err){}"
            )
            with open(ts_path, 'w', encoding='utf-8') as f:
                f.write(txt)
            print(f"Hardened Tachistoscope in: {ts_path}")

    # 3. Memory Churn
    mc_path = 'games/memory-churn/index.html'
    if os.path.exists(mc_path):
        with open(mc_path, 'r', encoding='utf-8') as f:
            txt = f.read()
        if "submitBtn.addEventListener('pointerdown'" not in txt:
            txt = txt.replace(
                "submitBtn.addEventListener('click', () => {",
                "submitBtn.style.touchAction='none'; submitBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); try{ e.target.setPointerCapture(e.pointerId); }catch(err){}"
            )
            with open(mc_path, 'w', encoding='utf-8') as f:
                f.write(txt)
            print(f"Hardened Memory Churn in: {mc_path}")

    # 4. Cyber Mines
    cm_path = 'games/cyber-mines/index.html'
    if os.path.exists(cm_path):
        with open(cm_path, 'r', encoding='utf-8') as f:
            txt = f.read()
        if "b.addEventListener('pointerdown'" not in txt:
            txt = txt.replace(
                "b.addEventListener('click', () => {",
                "b.style.touchAction='none'; b.addEventListener('pointerdown', (e) => { e.preventDefault(); try{ e.target.setPointerCapture(e.pointerId); }catch(err){}"
            ).replace(
                "document.getElementById('reset-mines').addEventListener('click', initM);",
                "const rBtn=document.getElementById('reset-mines'); rBtn.style.touchAction='none'; rBtn.addEventListener('pointerdown', (e)=>{ e.preventDefault(); try{ e.target.setPointerCapture(e.pointerId); }catch(err){} initM(); });"
            )
            with open(cm_path, 'w', encoding='utf-8') as f:
                f.write(txt)
            print(f"Hardened Cyber Mines in: {cm_path}")

unify_all_remaining_sandboxes()
print("Phase 2.5 fully normalized.")
