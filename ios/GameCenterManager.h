//
//  GameCenterManager.h
//  Fortress
//
//  Created by Matthew Steedman on 12/11/15.
//  Copyright © 2015 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>
@import GameKit;
#import "RCTBridgeModule.h"

@interface GameCenterManager : UIViewController <RCTBridgeModule, GKLocalPlayerListener, GKTurnBasedMatchmakerViewControllerDelegate>

@property GKTurnBasedMatch *currentMatch;
@property BOOL GKMatchmakerViewControllerActive;

@end
