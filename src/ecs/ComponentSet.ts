import { Card } from '@/solitaire';
import { PileConfig, TallyConfig } from '@/sublime-solitaire';
import { CursorFilmSet, FollowCamConfig, Sprite } from '@/void';

export interface ComponentSet {
  cursor: CursorFilmSet;
  card: Card;
  followCam: FollowCamConfig;
  followPoint: Record<never, never>;
  sprite: Sprite;
  pile: PileConfig;
  patienceTheDemon: Record<never, never>;
  vacantStock: Record<never, never>;
  tally: TallyConfig;
}
